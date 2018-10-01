'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
require('sinon-as-promised');

describe('lib/middleware/get-cms-url', () => {
	let origamiService;
	let getCmsUrl;
	let log;
	let requestPromise;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');
		log = origamiService.mockApp.ft.log;

		requestPromise = require('../../mock/request-promise.mock');
		mockery.registerMock('../request-promise', requestPromise);

		getCmsUrl = require('../../../../lib/middleware/get-cms-url');
	});

	it('exports a function', () => {
		assert.isFunction(getCmsUrl);
	});

	describe('getCmsUrl(config)', () => {
		let middleware;

		beforeEach(() => {
			middleware = getCmsUrl();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			const v1Uri = 'http://im.ft-static.com/content/images/mock-id.img';
			const v2Uri = 'http://prod-upp-image-read.ft.com/mock-id';

			beforeEach(done => {
				origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';
				origamiService.mockRequest.query.source = 'mock-source';

				// V2 responds with success
				requestPromise.withArgs({
					uri: v2Uri,
					method: 'HEAD',
					timeout: 10000
				}).resolves({
					statusCode: 200
				});

				middleware(origamiService.mockRequest, origamiService.mockResponse, done);
			});

			it('attempts to fetch the v2 API URL corresponding to the CMS ID', () => {
				assert.calledOnce(requestPromise);
				assert.calledWith(requestPromise, {
					uri: v2Uri,
					method: 'HEAD',
					timeout: 10000
				});
			});

			it('sets the `imageUrl` request param to the v2 API URL corresponding to the CMS ID', () => {
				assert.strictEqual(origamiService.mockRequest.params.imageUrl, v2Uri);
			});

			it('logs that the CMS ID was found in v2 of the API', () => {
				assert.calledWithExactly(log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=v2 source=mock-source');
				assert.neverCalledWith(log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=v1 source=mock-source');
				assert.neverCalledWith(log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=error source=mock-source');
			});

			describe('when the v2 API cannot find the image', () => {

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';
					log.info.reset();

					// V2 responds with a 404
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).resolves({
						statusCode: 404
					});

					// V1 responds with success
					requestPromise.withArgs({
						uri: v1Uri,
						method: 'HEAD',
						timeout: 10000
					}).resolves({
						statusCode: 200
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('attempts to fetch the v1 API URL corresponding to the CMS ID', () => {
					assert.calledTwice(requestPromise);
					assert.calledWith(requestPromise, {
						uri: v1Uri,
						method: 'HEAD',
						timeout: 10000
					});
				});

				it('sets the `imageUrl` request param to the v1 API URL corresponding to the CMS ID', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, v1Uri);
				});

				it('logs that the CMS ID was found in v1 of the API', () => {
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=v2 source=mock-source');
					assert.calledWithExactly(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=v1 source=mock-source');
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=error source=mock-source');
				});

			});

			describe('when neither the v1 or v2 API can find the image', () => {
				let responseError;

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';
					log.info.reset();

					// V2 responds with a 404
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).resolves({
						statusCode: 404
					});

					// V1 responds with a 404
					requestPromise.withArgs({
						uri: v1Uri,
						method: 'HEAD',
						timeout: 10000
					}).resolves({
						statusCode: 404
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a 404 error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Unable to get image mock-id from FT CMS v1 or v2');
					assert.strictEqual(responseError.status, 404);
					assert.strictEqual(responseError.cacheMaxAge, '30s');
				});

				it('logs that the CMS ID was found in neither API', () => {
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=v2 source=mock-source');
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=v1 source=mock-source');
					assert.calledWithExactly(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id cmsVersionUsed=error source=mock-source');
				});

			});

			describe('when the ftcms URL has a querystring', () => {

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id?foo=bar';

					// V2 responds with success
					requestPromise.withArgs({
						uri: `${v2Uri}?foo=bar`,
						method: 'HEAD',
						timeout: 10000
					}).resolves({
						statusCode: 200
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('attempts to fetch the API URLs with the querystring intact', () => {
					assert.calledOnce(requestPromise);
					assert.calledWith(requestPromise, {
						uri: `${v2Uri}?foo=bar`,
						method: 'HEAD',
						timeout: 10000
					});
				});

			});

			describe('when the URL is not an ftcms URL', () => {

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.params.imageUrl = 'http://foo/bar';
					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('does not touch the `imageUrl` request param', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, 'http://foo/bar');
				});

			});

			describe('when the request errors', () => {
				let responseError;

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 errors
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).rejects(new Error('mock error'));

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with an error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'mock error');
				});

			});

			describe('when the request fails a DNS lookup', () => {
				let dnsError;
				let responseError;

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 errors
					dnsError = new Error('mock error');
					dnsError.code = 'ENOTFOUND';
					dnsError.syscall = 'getaddrinfo';
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).rejects(dnsError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'DNS lookup failed for "http://prod-upp-image-read.ft.com/mock-id"');
				});

			});

			describe('when the request connection resets', () => {
				let resetError;
				let responseError;

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 errors
					resetError = new Error('mock error');
					resetError.code = 'ECONNRESET';
					resetError.syscall = 'mock-syscall';
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).rejects(resetError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Connection reset when requesting "http://prod-upp-image-read.ft.com/mock-id" (mock-syscall)');
				});

			});

			describe('when the request times out', () => {
				let responseError;
				let timeoutError;

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 errors
					timeoutError = new Error('mock error');
					timeoutError.code = 'ETIMEDOUT';
					timeoutError.syscall = 'mock-syscall';
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).rejects(timeoutError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Request timed out when requesting "http://prod-upp-image-read.ft.com/mock-id" (mock-syscall)');
				});

			});

			describe('when the request socket times out', () => {
				let responseError;
				let timeoutError;

				beforeEach(done => {
					requestPromise.reset();
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 errors
					timeoutError = new Error('mock error');
					timeoutError.code = 'ESOCKETTIMEOUT';
					timeoutError.syscall = 'mock-syscall';
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD',
						timeout: 10000
					}).rejects(timeoutError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Request socket timed out when requesting "http://prod-upp-image-read.ft.com/mock-id" (mock-syscall)');
				});

			});

		});

	});

});
