'use strict';

const assert = require('proclaim');
const nock = require('nock');

describe('lib/middleware/get-cms-url', () => {
	let origamiService;
	let getCmsUrl;
	let log;
	let config;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');
		log = origamiService.mockApp.ft.log;

		config = {contentApiKey: 'test'};

		getCmsUrl = require('../../../../lib/middleware/get-cms-url');
	});

	afterEach(() => {
		nock.cleanAll();
	});

	it('exports a function', () => {
		assert.isFunction(getCmsUrl);
	});

	describe('getCmsUrl(config)', () => {
		let middleware;

		beforeEach(() => {
			middleware = getCmsUrl(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let scope;
			const v2Uri = 'http://prod-upp-image-read.ft.com/mock-id1';

			beforeEach(done => {
				origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id1';
				origamiService.mockRequest.query.source = 'mock-source';
				origamiService.mockRequest.params.originalImageUrl = 'http://test.example/image.jpg';
				scope = nock('http://prod-upp-image-read.ft.com').persist();
				scope.head('/mock-id1').reply(200, 'I am an svg file', {
					'Content-Type': 'image/svg+xml; charset=utf-8',
				});

				middleware(origamiService.mockRequest, origamiService.mockResponse, done);
			});

			it('sets the `imageUrl` request param to the v2 API URL corresponding to the CMS ID', () => {
				assert.strictEqual(origamiService.mockRequest.params.imageUrl, v2Uri);
			});

			it('logs that the CMS ID was found in v2 of the API', () => {
				assert.isTrue(log.info.calledWithExactly('ftcms-check cmsId=mock-id1 cmsVersionUsed=v2 source=mock-source'));
				assert.isTrue(log.info.neverCalledWith('ftcms-check cmsId=mock-id1 cmsVersionUsed=v1 source=mock-source'));
				assert.isTrue(log.info.neverCalledWith('ftcms-check cmsId=mock-id1 cmsVersionUsed=error source=mock-source'));
			});

			describe('when the v2 API cannot find the image', () => {
				const v1Uri = 'http://im.ft-static.com/content/images/mock-id2.img';
				let nockScopeForV1Images;
				let nockScopeForV2Images;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id2';
					log.info.resetHistory();

					nockScopeForV1Images = nock('http://im.ft-static.com').persist();
					nockScopeForV1Images.head('/content/images/mock-id2.img').reply(200, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV2Images = nock('http://prod-upp-image-read.ft.com').persist();
					nockScopeForV2Images.head('/mock-id2').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('sets the `imageUrl` request param to the v1 API URL corresponding to the CMS ID', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, v1Uri);
				});

				it('logs that the CMS ID was found in v1 of the API', () => {
					assert.isTrue(origamiService.mockApp.ft.log.info.neverCalledWith('ftcms-check cmsId=mock-id2 cmsVersionUsed=v2 source=mock-source'));
					assert.isTrue(origamiService.mockApp.ft.log.info.calledWithExactly('ftcms-check cmsId=mock-id2 cmsVersionUsed=v1 source=mock-source'));
					assert.isTrue(origamiService.mockApp.ft.log.info.neverCalledWith('ftcms-check cmsId=mock-id2 cmsVersionUsed=error source=mock-source'));
				});

			});

			describe('when neither the v1 or v2 API can find the image', () => {
				let nockScopeForV1Images;
				let nockScopeForV2Images;
				let nockScopeForFallback;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id3';
					log.info.resetHistory();

					nockScopeForFallback = nock('http://test.example').persist();
					nockScopeForFallback.head('/image.jpg').reply(200, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV1Images = nock('http://im.ft-static.com').persist();
					nockScopeForV1Images.head('/content/images/mock-id3.img').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV2Images = nock('http://prod-upp-image-read.ft.com').persist();
					nockScopeForV2Images.head('/mock-id3').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('sets the `imageUrl` request param to the original image URL corresponding', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, origamiService.mockRequest.params.originalImageUrl);
				});
			});

			describe('when neither the v1, v2 API can find the image and the original image url does not exist', () => {
				let responseError;
				let nockScopeForV1Images;
				let nockScopeForV2Images;
				let nockScopeForFallback;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id4';
					log.info.resetHistory();

					nockScopeForFallback = nock('http://test.example').persist();
					nockScopeForFallback.head('/image.jpg').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV1Images = nock('http://im.ft-static.com').persist();
					nockScopeForV1Images.head('/content/images/mock-id4.img').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV2Images = nock('http://prod-upp-image-read.ft.com').persist();
					nockScopeForV2Images.head('/mock-id4').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a 404 error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Unable to get image mock-id4 from Content API v1 or v2');
					assert.strictEqual(responseError.status, 404);
					assert.strictEqual(responseError.cacheMaxAge, '1y');
				});

				it('logs that the CMS ID was found in neither API', () => {
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id4 cmsVersionUsed=v2 source=mock-source');
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id4 cmsVersionUsed=v1 source=mock-source');
					assert.calledWithExactly(origamiService.mockApp.ft.log.info, 'ftcms-check cmsId=mock-id4 cmsVersionUsed=error source=mock-source');
				});

			});

			describe('when the ftcms URL has a querystring', () => {
				const v2Uri = 'http://prod-upp-image-read.ft.com/mock-id5?foo=bar';
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id5?foo=bar';
					scope = nock('http://prod-upp-image-read.ft.com').persist();
					scope.head('/mock-id5?foo=bar').reply(200, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('sets the `imageUrl` request param to the v2 API URL corresponding to the CMS ID including the querystring', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, v2Uri);
				});

			});

			describe('when the URL is not an ftcms URL', () => {

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'http://foo/bar';
					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('does not touch the `imageUrl` request param', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, 'http://foo/bar');
				});

			});

			describe('when the request errors', () => {
				let responseError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id6';

					scope = nock('http://prod-upp-image-read.ft.com').persist();
					scope.head('/mock-id6').replyWithError(new Error('mock error'));

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
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id7';

					// V2 errors
					dnsError = new Error('mock error');
					dnsError.code = 'ENOTFOUND';
					scope = nock('http://prod-upp-image-read.ft.com').persist();
					scope.head('/mock-id7').replyWithError(dnsError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'DNS lookup failed for "http://prod-upp-image-read.ft.com/mock-id7"');
				});

			});

			describe('when the request connection resets', () => {
				let resetError;
				let responseError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id8';

					// V2 errors
					resetError = new Error('mock error');
					resetError.code = 'ECONNRESET';
					resetError.syscall = 'mock-syscall';
					scope = nock('http://prod-upp-image-read.ft.com').persist();
					scope.head('/mock-id8').replyWithError(resetError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Connection reset when requesting "http://prod-upp-image-read.ft.com/mock-id8" (mock-syscall)');
				});

			});

			describe('when the request times out', () => {
				let responseError;
				let timeoutError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id9';

					// V2 errors
					timeoutError = new Error('mock error');
					timeoutError.code = 'ETIMEDOUT';
					timeoutError.syscall = 'mock-syscall';
					scope = nock('http://prod-upp-image-read.ft.com').persist();
					scope.head('/mock-id9').replyWithError(timeoutError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Request timed out when requesting "http://prod-upp-image-read.ft.com/mock-id9" (mock-syscall)');
				});

			});

			describe('when the request socket times out', () => {
				let responseError;
				let timeoutError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = 'ftcms:mock-id10';

					// V2 errors
					timeoutError = new Error('mock error');
					timeoutError.code = 'ESOCKETTIMEOUT';
					timeoutError.syscall = 'mock-syscall';
					scope = nock('http://prod-upp-image-read.ft.com').persist();
					scope.head('/mock-id10').replyWithError(timeoutError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Request socket timed out when requesting "http://prod-upp-image-read.ft.com/mock-id10" (mock-syscall)');
				});

			});

		});

	});

});
