'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/image-service', () => {
	let about;
	let basePath;
	let HealthChecks;
	let httpProxy;
	let imageService;
	let origamiService;
	let requireAll;

	beforeEach(() => {
		basePath = path.resolve(`${__dirname}/../../..`);

		about = {mockAboutInfo: true};
		mockery.registerMock('../about.json', about);

		HealthChecks = require('../mock/health-checks.mock');
		mockery.registerMock('./health-checks', HealthChecks);

		httpProxy = require('../mock/http-proxy.mock');
		mockery.registerMock('http-proxy', httpProxy);

		origamiService = require('../mock/origami-service.mock');
		mockery.registerMock('@financial-times/origami-service', origamiService);

		requireAll = require('../mock/require-all.mock');
		mockery.registerMock('require-all', requireAll);

		imageService = require(basePath);
	});

	it('exports a function', () => {
		assert.isFunction(imageService);
	});

	describe('imageService(options)', () => {
		let options;
		let returnValue;
		let routes;

		beforeEach(() => {
			options = {
				environment: 'test',
				port: 1234,
				systemCode: 'example-system-code'
			};
			routes = {
				foo: sinon.spy(),
				bar: sinon.spy()
			};
			requireAll.returns(routes);
			returnValue = imageService(options);
		});

		it('creates an Origami Service application', () => {
			assert.calledOnce(origamiService);
		});

		it('creates a HealthChecks object', () => {
			assert.calledOnce(HealthChecks);
			assert.calledWithNew(HealthChecks);
			assert.calledWithExactly(HealthChecks, options);
		});

		it('sets `options.healthCheck` to the created health check function', () => {
			assert.calledOnce(HealthChecks.mockHealthChecks.getFunction);
			assert.strictEqual(options.healthCheck, HealthChecks.mockFunction);
		});

		it('sets `options.goodToGoTest` to the created health check gtg function', () => {
			assert.calledOnce(HealthChecks.mockHealthChecks.getGoodToGoFunction);
			assert.strictEqual(options.goodToGoTest, HealthChecks.mockGoodToGoFunction);
		});

		it('sets `options.about` to the contents of about.json', () => {
			assert.strictEqual(options.about, about);
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
						'x-identifying-information': 'oops',
						'user-agent': 'my-ua'
					}
				};
				response = {};
				handler(proxyRequest, request, response, proxyOptions);
			});

			it('should remove all non-whitelisted headers from the proxy request', () => {
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'cookie');
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'host');
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'x-identifying-information');
				assert.calledWithExactly(httpProxy.mockProxyRequest.removeHeader, 'user-agent');
			});

			it('should leave all whitelisted headers from the proxy request intact', () => {
				assert.neverCalledWith(httpProxy.mockProxyRequest.removeHeader, 'accept-encoding');
				assert.neverCalledWith(httpProxy.mockProxyRequest.removeHeader, 'accept-language');
				assert.neverCalledWith(httpProxy.mockProxyRequest.removeHeader, 'accept');
			});

			it('should set the `Host` header of the proxy request to the host in `proxyOptions.target`', () => {
				assert.calledWithExactly(httpProxy.mockProxyRequest.setHeader, 'Host', 'foo.bar');
			});

			it('should set the `User-Agent` header of the proxy request to identify the Image Service', () => {
				assert.calledWithExactly(httpProxy.mockProxyRequest.setHeader, 'User-Agent', 'Origami Image Service (https://github.com/Financial-Times/origami-image-service)');
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
					headers: {},
					params: {
						scheme: 'http'
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
					'Surrogate-Key': 'origami-image-service image/jpeg http',
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

			describe('when the request has an `accept` header which includes "image/jxr"', () => {
				beforeEach(() => {
					request.headers['accept'] = 'image/jxr';
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

				describe('when the `X-Cld-Error` header is caused by the image being an HTML page', () => {
					let response;

					beforeEach(() => {
						proxyResponse.headers['x-cld-error'] = 'Resource not found http://foo/bar - HTML response';
						proxyResponse.statusCode = 123;
						response = {};
						handler(proxyResponse, request, response);
					});

					it('sets the response `cloudinaryError` property to a 400 error', () => {
						assert.instanceOf(response.cloudinaryError, Error);
						assert.strictEqual(response.cloudinaryError.message, 'The requested resource is not an image');
						assert.strictEqual(response.cloudinaryError.status, 400);
					});

				});

				describe('when the `X-Cld-Error` header is a 400/403 caused by a missing image in the S3 bucket', () => {
					let response;

					beforeEach(() => {
						proxyResponse.headers['x-cld-error'] = 'Error in loading http://foo/bar - 403 forbidden';
						proxyResponse.statusCode = 400;
						response = {};
						handler(proxyResponse, request, response);
					});

					it('sets the response `cloudinaryError` property to a 404 error', () => {
						assert.instanceOf(response.cloudinaryError, Error);
						assert.strictEqual(response.cloudinaryError.message, 'The requested image could not be found');
						assert.strictEqual(response.cloudinaryError.status, 404);
					});

				});

				describe('when the `X-Cld-Error` header is a not found error', () => {
					let response;

					beforeEach(() => {
						proxyResponse.headers['x-cld-error'] = 'Resource not found http://foo/bar';
						proxyResponse.statusCode = 404;
						response = {};
						handler(proxyResponse, request, response);
					});

					it('sets the response `cloudinaryError` property to a 404 error', () => {
						assert.instanceOf(response.cloudinaryError, Error);
						assert.strictEqual(response.cloudinaryError.message, 'The requested image could not be found');
						assert.strictEqual(response.cloudinaryError.status, 404);
					});

				});

			});

		});

		it('adds a listener on the HTTP proxy\'s `error` event', () => {
			assert.calledWith(httpProxy.mockProxyServer.on, 'error');
		});

		describe('HTTP Proxy `error` handler', () => {

			it('should be the created error handling middleware', () => {
				assert.calledWithExactly(httpProxy.mockProxyServer.on, 'error', origamiService.middleware.errorHandler.firstCall.returnValue);
			});

		});

		it('sets the application `proxy` property to the created HTTP proxy', () => {
			assert.strictEqual(origamiService.mockApp.proxy, httpProxy.mockProxyServer);
		});

		it('creates and mounts getBasePath middleware', () => {
			assert.calledOnce(origamiService.middleware.getBasePath);
			assert.calledWithExactly(origamiService.middleware.getBasePath);
			assert.calledWith(origamiService.mockApp.use, origamiService.middleware.getBasePath.firstCall.returnValue);
		});

		it('loads all of the routes', () => {
			assert.calledOnce(requireAll);
			assert.isObject(requireAll.firstCall.args[0]);
			assert.strictEqual(requireAll.firstCall.args[0].dirname, `${basePath}/lib/routes`);
			assert.isFunction(requireAll.firstCall.args[0].resolve);
		});

		it('calls each route with the Origami Service application', () => {
			const route = sinon.spy();
			requireAll.firstCall.args[0].resolve(route);
			assert.calledOnce(route);
			assert.calledWithExactly(route, origamiService.mockApp);
		});

		it('creates and mounts not found middleware', () => {
			assert.calledOnce(origamiService.middleware.notFound);
			assert.calledWithExactly(origamiService.middleware.notFound);
			assert.calledWith(origamiService.mockApp.use, origamiService.middleware.notFound.firstCall.returnValue);
		});

		it('creates and mounts error handling middleware', () => {
			assert.called(origamiService.middleware.errorHandler);
			assert.calledWithExactly(origamiService.middleware.errorHandler);
			assert.calledWith(origamiService.mockApp.use, origamiService.middleware.errorHandler.firstCall.returnValue);
		});

		it('returns the created application', () => {
			assert.strictEqual(returnValue, origamiService.mockApp);
		});

	});

});
