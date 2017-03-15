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
	let base64;
	let utf8;

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

		base64 = {
			encode: sinon.stub().returnsArg(0)
		};
		mockery.registerMock('base-64', base64);

		utf8 = {
			encode: sinon.stub().returnsArg(0)
		};
		mockery.registerMock('utf8', utf8);

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
				proxyTimeout: 25000,
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
					app: origamiService.mockApp,
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
					'content-type': 'IMAGE/JPEG', // uppercase to test normalisation
					'content-length': '1234',
					'content-disposition': 'foo',
					'etag': '123',
					'last-modified': 'some time'
				};
				request = {
					app: origamiService.mockApp,
					headers: {},
					params: {
						scheme: 'HTTP',
						schemeUrl: 'http://example.com/PICTURE.png' // uppercase to test normalisation
					}
				};
				base64.encode = sinon.spy(value => `${value}-mock-base64`);
				utf8.encode = sinon.spy(value => `${value}-mock-utf8`);
				handler(proxyResponse, request);
			});

			afterEach(() => {
				clock.restore();
			});

			it('should utf8 and base64 encode a normalised key for image type', () => {
				assert.calledWithExactly(utf8.encode, 'image/jpeg');
				assert.calledWithExactly(base64.encode, 'image/jpeg-mock-utf8');
			});

			it('should utf8 and base64 encode a normalised key for scheme', () => {
				assert.calledWithExactly(utf8.encode, 'http');
				assert.calledWithExactly(base64.encode, 'http-mock-utf8');
			});

			it('should utf8 and base64 encode a key for the URL', () => {
				assert.calledWithExactly(utf8.encode, 'http://example.com/PICTURE.png');
				assert.calledWithExactly(base64.encode, 'http://example.com/PICTURE.png-mock-utf8');
			});

			it('should set the headers of the proxy response to a subset of the original headers', () => {
				assert.deepEqual(httpProxy.mockProxyResponse.headers, {
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': 'public, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800',
					'Content-Encoding': undefined,
					'Content-Type': 'IMAGE/JPEG',
					'Content-Length': '1234',
					'Connection': 'keep-alive',
					'Etag': '123',
					'Expires': 'Thu, 08 Jan 1970 00:00:10 GMT',
					'FT-Image-Format': 'default',
					'Last-Modified': 'some time',
					'Surrogate-Control': 'public, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800',
					'Surrogate-Key': 'origami-image-service image/jpeg-mock-utf8-mock-base64 http-mock-utf8-mock-base64 http://example.com/PICTURE.png-mock-utf8-mock-base64',
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

			describe('when the proxy response has no `X-Cld-Error` header but has a non-200 status', () => {
				let response;

				beforeEach(() => {
					proxyResponse.statusCode = 503;
					response = {};
					handler(proxyResponse, request, response);
				});

				it('sets the headers of the proxy response to an empty object', () => {
					assert.deepEqual(httpProxy.mockProxyResponse.headers, {});
				});

				it('sets the response `cloudinaryError` property to an error object representing the error', () => {
					assert.instanceOf(response.cloudinaryError, Error);
					assert.strictEqual(response.cloudinaryError.message, 'Service Unavailable');
					assert.strictEqual(response.cloudinaryError.status, 503);
				});

			});

			describe('when the proxy response has a 30x status', () => {
				let response;

				beforeEach(() => {
					proxyResponse.statusCode = 302;
					proxyResponse.headers.location = 'https://redirect/';
					response = {};
					handler(proxyResponse, request, response);
				});

				it('sets the headers of the proxy response to an empty object', () => {
					assert.deepEqual(httpProxy.mockProxyResponse.headers, {});
				});

				it('sets the response `cloudinaryError` property to an error object representing the error', () => {
					assert.instanceOf(response.cloudinaryError, Error);
					assert.strictEqual(response.cloudinaryError.message, 'Internal Server Error');
					assert.strictEqual(response.cloudinaryError.status, 500);
				});

			});

			describe('when the request is for an FTCMS image', () => {
				it('Sets the Surrogate-Control header to a year', () => {
					request.params.scheme = 'ftcms';
					handler(proxyResponse, request);
					assert.strictEqual(httpProxy.mockProxyResponse.headers['Surrogate-Control'], 'max-age=31449600, stale-while-revalidate=31449600, stale-if-error=31449600');
				});
			});

			describe('when the request is not for an FTCMS image', () => {
				it('Sets the Surrogate-Control header to a year', () => {
					request.params.scheme = 'https';
					handler(proxyResponse, request);
					assert.strictEqual(httpProxy.mockProxyResponse.headers['Surrogate-Control'], 'public, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800');
				});
			});

		});

		it('adds a listener on the HTTP proxy\'s `error` event', () => {
			assert.calledWith(httpProxy.mockProxyServer.on, 'error');
		});

		describe('HTTP Proxy `error` handler', () => {
			let handler;
			let proxyError;
			let serviceErrorHandler;

			beforeEach(() => {
				serviceErrorHandler = origamiService.middleware.errorHandler.firstCall.returnValue;
				proxyError = new Error('mock error');
				handler = httpProxy.mockProxyServer.on.withArgs('error').firstCall.args[1];
				origamiService.mockRequest.url = 'mock-url';
				handler(proxyError, origamiService.mockRequest, origamiService.mockResponse);
			});

			it('calls the error handling middleware', () => {
				assert.calledWithExactly(serviceErrorHandler, proxyError, origamiService.mockRequest, origamiService.mockResponse);
			});

			describe('when the error represents a failed DNS lookup', () => {

				beforeEach(() => {
					serviceErrorHandler.reset();
					proxyError.code = 'ENOTFOUND';
					proxyError.syscall = 'getaddrinfo';
					handler(proxyError, origamiService.mockRequest, origamiService.mockResponse);
				});

				it('calls the error handling middleware with a descriptive error', () => {
					assert.instanceOf(serviceErrorHandler.firstCall.args[0], Error);
					assert.strictEqual(serviceErrorHandler.firstCall.args[0].message, 'Proxy DNS lookup failed for "mock-url"');
				});

			});

			describe('when the error represents a connection reset', () => {

				beforeEach(() => {
					serviceErrorHandler.reset();
					proxyError.code = 'ECONNRESET';
					proxyError.syscall = 'mock-syscall';
					handler(proxyError, origamiService.mockRequest, origamiService.mockResponse);
				});

				it('calls the error handling middleware with a descriptive error', () => {
					assert.instanceOf(serviceErrorHandler.firstCall.args[0], Error);
					assert.strictEqual(serviceErrorHandler.firstCall.args[0].message, 'Proxy connection reset when requesting "mock-url" (mock-syscall)');
				});

			});

			describe('when the error represents a request timeout', () => {

				beforeEach(() => {
					serviceErrorHandler.reset();
					proxyError.code = 'ETIMEDOUT';
					proxyError.syscall = 'mock-syscall';
					handler(proxyError, origamiService.mockRequest, origamiService.mockResponse);
				});

				it('calls the error handling middleware with a descriptive error', () => {
					assert.instanceOf(serviceErrorHandler.firstCall.args[0], Error);
					assert.strictEqual(serviceErrorHandler.firstCall.args[0].message, 'Proxy request timed out when requesting "mock-url" (mock-syscall)');
				});

			});

			describe('when the error is possibly a proxy timeout', () => {

				beforeEach(() => {
					serviceErrorHandler.reset();
					proxyError.code = 'ECONNRESET';
					proxyError.syscall = undefined;
					handler(proxyError, origamiService.mockRequest, origamiService.mockResponse);
				});

				it('calls the error handling middleware with a descriptive error', () => {
					assert.instanceOf(serviceErrorHandler.firstCall.args[0], Error);
					assert.strictEqual(serviceErrorHandler.firstCall.args[0].message, 'Proxy connection reset when requesting "mock-url" (possible timeout)');
				});

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
