'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const path = require('path');
const pkg = require('../../../package.json');
const sinon = require('sinon');

describe('lib/image-service', () => {
	let basePath;
	let express;
	let handleErrors;
	let healthChecks;
	let httpProxy;
	let imageService;
	let morgan;
	let notFound;
	let requireAll;

	beforeEach(() => {
		basePath = path.resolve(`${__dirname}/../../..`);

		const imageServicePath = path.resolve(`${basePath}/lib/image-service`);

		express = require('../mock/n-express.mock');
		mockery.registerMock('@financial-times/n-express', express);

		handleErrors = sinon.stub().returns(sinon.spy());
		mockery.registerMock('./middleware/handle-errors', handleErrors);

		healthChecks = require('../mock/health-checks.mock');
		mockery.registerMock('./health-checks', healthChecks);

		httpProxy = require('../mock/http-proxy.mock');
		mockery.registerMock('http-proxy', httpProxy);

		morgan = require('../mock/morgan.mock');
		mockery.registerMock('morgan', morgan);

		notFound = sinon.spy();
		mockery.registerMock('./middleware/not-found', notFound);

		requireAll = require('../mock/require-all.mock');
		mockery.registerMock('require-all', requireAll);

		imageService = require(imageServicePath);
	});

	it('exports a function', () => {
		assert.isFunction(imageService);
	});

	describe('imageService(config)', () => {
		let config;
		let returnedPromise;
		let routes;

		beforeEach(() => {
			config = {
				basePath: '/my/base/path',
				environment: 'test',
				port: 1234
			};
			routes = {
				foo: sinon.spy(),
				bar: sinon.spy()
			};
			requireAll.returns(routes);
			returnedPromise = imageService(config);
		});

		it('returns a promise', () => {
			assert.instanceOf(returnedPromise, Promise);
		});

		it('creates an Express application', () => {
			assert.calledOnce(express);
		});

		it('passes health-checks into the created application', () => {
			const options = express.firstCall.args[0];
			assert.isObject(options);
			assert.isArray(options.healthChecks);
			assert.strictEqual(options.healthChecks[0], healthChecks.cloudinary);
			assert.strictEqual(options.healthChecks[1], healthChecks.customSchemeStore);
		});

		it('configures handlebars', () => {
			const options = express.firstCall.args[0];
			assert.isObject(options);
			assert.isTrue(options.withHandlebars);
			assert.strictEqual(options.layoutsDir, path.resolve(__dirname, '../../../views/layouts'));
			assert.deepEqual(options.partialsDir, [path.resolve(__dirname, '../../../views')]);
		});

		it('configures assets (turns them off)', () => {
			const options = express.firstCall.args[0];
			assert.isObject(options);
			assert.isFalse(options.withAssets);
		});

		it('creates an error handling middleware', () => {
			assert.calledOnce(handleErrors);
			assert.calledWith(handleErrors, config);
		});

		it('creates an HTTP proxy', () => {
			assert.calledOnce(httpProxy.createProxyServer);
			assert.calledWithExactly(httpProxy.createProxyServer, {
				ignorePath: true,
				secure: false
			});
		});

		it('adds a listener on the HTTP proxy\'s `proxyReq` event', () => {
			assert.calledWith(httpProxy.mockProxyServer.on, 'proxyReq');
		});

		describe('HTTP Proxy `proxyReq` handler', () => {
			let proxyOptions;
			let proxyRequest;
			let request;
			let response;

			beforeEach(() => {
				const handler = httpProxy.mockProxyServer.on.withArgs('proxyReq').firstCall.args[1];
				proxyOptions = {
					target: 'http://foo.bar/baz/qux'
				};
				proxyRequest = httpProxy.mockProxyRequest;
				request = {
					headers: {
						'accept-encoding': 'bar',
						'accept-language': 'baz',
						'accept': 'foo',
						'cookie': 'qux',
						'host': 'www.example.com',
						'user-agent': 'test',
						'x-identifying-information': 'oops'
					}
				};
				response = {};
				handler(proxyRequest, request, response, proxyOptions);
			});

			it('should remove all non-whitelisted headers from the proxy request', () => {
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'cookie');
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'host');
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'user-agent');
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'x-identifying-information');
			});

			it('should leave all whitelisted headers from the proxy request intact', () => {
				assert.neverCalledWith(httpProxy.mockProxyRequest.removeHeader, 'accept-encoding');
				assert.neverCalledWith(httpProxy.mockProxyRequest.removeHeader, 'accept-language');
				assert.neverCalledWith(httpProxy.mockProxyRequest.removeHeader, 'accept');
			});

			it('should set the `Host` header of the proxy request to the host in `proxyOptions.target`', () => {
				assert.calledWithExactly(httpProxy.mockProxyRequest.setHeader, 'Host', 'foo.bar');
			});

			it('should set the `User-Agent` header of the proxy request to the image service name/version', () => {
				assert.calledWithExactly(httpProxy.mockProxyRequest.setHeader, 'User-Agent', `${pkg.name}/${pkg.version}`);
			});

		});

		it('adds a listener on the HTTP proxy\'s `proxyRes` event', () => {
			assert.calledWith(httpProxy.mockProxyServer.on, 'proxyRes');
		});

		describe('HTTP Proxy `proxyRes` handler', () => {
			let clock;
			let proxyResponse;
			let request;
			let handler;

			beforeEach(() => {
				clock = sinon.useFakeTimers();
				clock.tick(10000); // tick 10 seconds
				handler = httpProxy.mockProxyServer.on.withArgs('proxyRes').firstCall.args[1];
				proxyResponse = httpProxy.mockProxyResponse;
				proxyResponse.headers = {
					'foo': 'bar',
					'cache-control': 'public, max-age=123',
					'content-type': 'image/jpeg',
					'content-length': '1234',
					'content-disposition': 'foo',
					'etag': '123',
					'last-modified': 'some time'
				};
				request = {
					headers: {
						'ft-image-format': 'foo'
					}
				};
				handler(proxyResponse, request);
			});

			afterEach(() => {
				clock.restore();
			});

			it('should set the headers of the proxy response to a subset of the original headers', () => {
				assert.deepEqual(httpProxy.mockProxyResponse.headers, {
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': 'public, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800',
					'Content-Encoding': undefined,
					'Content-Type': 'image/jpeg',
					'Content-Length': '1234',
					'Connection': 'keep-alive',
					'Etag': '123',
					'Expires': 'Thu, 08 Jan 1970 00:00:10 GMT',
					'FT-Image-Format': 'default',
					'Last-Modified': 'some time',
					'Vary': 'FT-image-format, Content-Dpr'
				});
			});

			describe('when request.transform has a dpr', () => {
				beforeEach(() => {
					request.transform = {
						getDpr: sinon.stub().returns(2)
					};
					handler(proxyResponse, request);
				});

				it('should include a `Content-Dpr` header in the response', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['Content-Dpr'], 2);
				});

			});

			describe('when the request has an `accept` header which includes "image/webp"', () => {
				beforeEach(() => {
					request.headers['accept'] = 'image/webp';
					handler(proxyResponse, request);
				});

				it('should set the `FT-Image-Format` header in the response to "webp"', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['FT-Image-Format'], 'webp');
				});
			});

			describe('when the request has an `FT-Normalised-UA` header set to "edge"', () => {
				beforeEach(() => {
					request.headers['ft-normalised-ua'] = 'edge';
					handler(proxyResponse, request);
				});

				it('should set the `FT-Image-Format` header in the response to jpegxr', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['FT-Image-Format'], 'jpegxr');
				});
			});

			describe('when the request has an `FT-Normalised-UA` header set to "iemobile"', () => {
				beforeEach(() => {
					request.headers['ft-normalised-ua'] = 'iemobile/10';
					handler(proxyResponse, request);
				});

				it('should set the `FT-Image-Format` header in the response to jpegxr', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['FT-Image-Format'], 'jpegxr');
				});
			});

			describe('when the request has an `FT-Normalised-UA` header set to "ie/9"', () => {
				beforeEach(() => {
					request.headers['ft-normalised-ua'] = 'ie/9';
					handler(proxyResponse, request);
				});

				it('should set the `FT-Image-Format` header in the response to jpegxr', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['FT-Image-Format'], 'jpegxr');
				});
			});

			describe('when the request has an `FT-Normalised-UA` header set to "ie/10"', () => {
				beforeEach(() => {
					request.headers['ft-normalised-ua'] = 'ie/10';
					handler(proxyResponse, request);
				});

				it('should set the `FT-Image-Format` header in the response to jpegxr', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['FT-Image-Format'], 'jpegxr');
				});
			});

			describe('when the request has an `FT-Normalised-UA` header set to "ie/11"', () => {
				beforeEach(() => {
					request.headers['ft-normalised-ua'] = 'ie/11';
					handler(proxyResponse, request);
				});

				it('should set the `FT-Image-Format` header in the response to jpegxr', () => {
					assert.strictEqual(httpProxy.mockProxyResponse.headers['FT-Image-Format'], 'jpegxr');
				});
			});

			describe('when the proxy response has an `X-Cld-Error` header', () => {
				let response;

				beforeEach(() => {
					proxyResponse.headers['x-cld-error'] = 'Cloudinary Error';
					proxyResponse.statusCode = 123;
					response = {};
					handler(proxyResponse, request, response);
				});

				it('sets the headers of the proxy response to an empty object', () => {
					assert.deepEqual(httpProxy.mockProxyResponse.headers, {});
				});

				it('sets the response `cloudinaryError` property to an error object representing the Cloudinary error', () => {
					assert.instanceOf(response.cloudinaryError, Error);
					assert.strictEqual(response.cloudinaryError.message, 'Cloudinary Error');
					assert.strictEqual(response.cloudinaryError.status, 123);
				});

			});

		});

		it('adds a listener on the HTTP proxy\'s `error` event', () => {
			assert.calledWith(httpProxy.mockProxyServer.on, 'error');
		});

		describe('HTTP Proxy `error` handler', () => {

			it('should be the created error handling middleware', () => {
				assert.calledWithExactly(httpProxy.mockProxyServer.on, 'error', handleErrors.firstCall.returnValue);
			});

		});

		it('sets the Express application `proxy` property to the created HTTP proxy', () => {
			assert.strictEqual(express.mockApp.proxy, httpProxy.mockProxyServer);
		});

		it('sets the Express application `imageServiceConfig` property to `config`', () => {
			assert.strictEqual(express.mockApp.imageServiceConfig, config);
		});

		it('sets `app.locals.basePath` to `config.basePath`', () => {
			assert.strictEqual(express.mockApp.locals.basePath, config.basePath);
		});

		it('initialises the health-checks', () => {
			assert.calledOnce(healthChecks.init);
			assert.calledWithExactly(healthChecks.init, config);
		});

		it('mounts Morgan middleware to log requests', () => {
			assert.calledWithExactly(morgan, 'combined');
			assert.calledWithExactly(express.mockApp.use, morgan.mockMiddleware);
		});

		it('registers a "/__gtg" route', () => {
			assert.calledWith(express.mockApp.get, '/__gtg');
		});

		describe('"/__gtg" route', () => {
			let gtgRoute;

			beforeEach(() => {
				gtgRoute = express.mockApp.get.withArgs('/__gtg').firstCall.args[1];
				gtgRoute(express.mockRequest, express.mockResponse);
			});

			it('sets the response status to 200', () => {
				assert.calledOnce(express.mockResponse.status);
				assert.calledWithExactly(express.mockResponse.status, 200);
			});

			it('sets the response body to "OK"', () => {
				assert.calledOnce(express.mockResponse.send);
				assert.calledWithExactly(express.mockResponse.send, 'OK');
			});

		});

		it('loads all of the routes', () => {
			assert.calledOnce(requireAll);
			assert.isObject(requireAll.firstCall.args[0]);
			assert.strictEqual(requireAll.firstCall.args[0].dirname, `${basePath}/lib/routes`);
			assert.isFunction(requireAll.firstCall.args[0].resolve);
		});

		it('mounts a static middleware at `config.basePath`', () => {
			assert.calledWithExactly(express.static, 'public');
			assert.calledWithExactly(express.mockApp.use, config.basePath, express.mockStaticMiddleware);
		});

		it('mounts an express router at `config.basePath`', () => {
			assert.calledWithExactly(express.mockApp.use, config.basePath, express.mockRouter);
		});

		it('calls each route with the Express application and Router', () => {
			const route = sinon.spy();
			requireAll.firstCall.args[0].resolve(route);
			assert.calledOnce(route);
			assert.calledWithExactly(route, express.mockApp, express.mockRouter);
		});

		it('mounts middleware to handle routes that are not found', () => {
			assert.calledWith(express.mockApp.use, notFound);
		});

		it('mounts middleware to handle errors', () => {
			assert.calledWith(express.mockApp.use, handleErrors.firstCall.returnValue);
		});

		it('starts the Express application on the port in `config.port`', () => {
			assert.calledOnce(express.mockApp.listen);
			assert.calledWith(express.mockApp.listen, config.port);
		});

		describe('.then()', () => {
			let service;

			beforeEach(() => {
				return returnedPromise.then(value => {
					service = value;
				});
			});

			it('resolves with the created Express application', () => {
				assert.strictEqual(service, express.mockApp);
			});

			it('stores the created server in the Express application `server` property', () => {
				assert.strictEqual(service.server, express.mockServer);
			});

		});

		describe('when the Express application errors on startup', () => {
			let expressError;

			beforeEach(() => {
				expressError = new Error('Express failed to start');
				express.mockApp.listen.rejects(expressError);
				returnedPromise = imageService(config);
			});

			describe('.catch()', () => {
				let caughtError;

				beforeEach(done => {
					returnedPromise.then(done).catch(error => {
						caughtError = error;
						done();
					});
				});

				it('fails with the Express error', () => {
					assert.strictEqual(caughtError, expressError);
				});

			});

		});

		describe('when `config.basePath` is not set', () => {

			beforeEach(() => {
				delete config.basePath;
				returnedPromise = imageService(config);
			});

			it('sets `config.basePath` to an empty string', () => {
				assert.strictEqual(config.basePath, '');
			});

		});

		describe('when `config.suppressLogs` is `true`', () => {

			beforeEach(() => {
				morgan.reset();
				express.mockApp.use.reset();
				config.suppressLogs = true;
				returnedPromise = imageService(config);
			});

			it('does not mount Morgan middleware', () => {
				assert.notCalled(morgan);
				assert.neverCalledWith(express.mockApp.use, morgan.mockMiddleware);
			});

		});

	});

});
