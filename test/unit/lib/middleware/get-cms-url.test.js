'use strict';

const assert = require('proclaim');
const nock = require('nock');
const {v4: generateUuid} = require('uuid');

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
      const imageUuid = generateUuid();
      let scope;
      const v2Uri = `https://prod-upp-image-read.ft.com/${imageUuid}`;

      beforeEach(done => {
        origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;
        origamiService.mockRequest.query.source = 'mock-source';
        origamiService.mockRequest.params.originalImageUrl = 'http://test.example/image.jpg';
        scope = nock('https://prod-upp-image-read.ft.com').persist();
        scope.head(`/${imageUuid}`).reply(200, 'I am an svg file', {
          'Content-Type': 'image/svg+xml; charset=utf-8',
        });

        middleware(origamiService.mockRequest, origamiService.mockResponse, done);
      });

      it('sets the `imageUrl` request param to the v2 API URL corresponding to the CMS ID', () => {
        assert.strictEqual(origamiService.mockRequest.params.imageUrl, v2Uri);
      });

      it('logs that the CMS ID was found in v2 of the API', () => {
        assert.isTrue(log.info.calledWithExactly(`ftcms-check cmsId=${imageUuid} cmsVersionUsed=v2 source=mock-source`));
        assert.isTrue(log.info.neverCalledWith(`ftcms-check cmsId=${imageUuid} cmsVersionUsed=v1 source=mock-source`));
        assert.isTrue(log.info.neverCalledWith(`ftcms-check cmsId=${imageUuid} cmsVersionUsed=error source=mock-source`));
      });

			describe('when the v2 API cannot find the image', () => {
        const imageUuid = generateUuid();
				const v1Uri = `https://im.ft-static.com/content/images/${imageUuid}.img`;
				let nockScopeForV1Images;
				let nockScopeForV2Images;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;
					log.info.resetHistory();

					nockScopeForV1Images = nock('https://im.ft-static.com').persist();
					nockScopeForV1Images.head(`/content/images/${imageUuid}.img`).reply(200, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV2Images = nock('https://prod-upp-image-read.ft.com').persist();
					nockScopeForV2Images.head(`/${imageUuid}`).reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('sets the `imageUrl` request param to the v1 API URL corresponding to the CMS ID', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, v1Uri);
				});

				it('logs that the CMS ID was found in v1 of the API', () => {
					assert.isTrue(origamiService.mockApp.ft.log.info.neverCalledWith(`ftcms-check cmsId=${imageUuid} cmsVersionUsed=v2 source=mock-source`));
					assert.isTrue(origamiService.mockApp.ft.log.info.calledWithExactly(`ftcms-check cmsId=${imageUuid} cmsVersionUsed=v1 source=mock-source`));
					assert.isTrue(origamiService.mockApp.ft.log.info.neverCalledWith(`ftcms-check cmsId=${imageUuid} cmsVersionUsed=error source=mock-source`));
				});

			});

			describe('when neither the v1 or v2 API can find the image', () => {
        const imageUuid = generateUuid();
				let nockScopeForV1Images;
				let nockScopeForV2Images;
				let nockScopeForFallback;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;
					log.info.resetHistory();

					nockScopeForFallback = nock('http://test.example').persist();
					nockScopeForFallback.head('/image.jpg').reply(200, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV1Images = nock('https://im.ft-static.com').persist();
					nockScopeForV1Images.head(`/content/images/${imageUuid}.img`).reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV2Images = nock('https://prod-upp-image-read.ft.com').persist();
					nockScopeForV2Images.head(`/${imageUuid}`).reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, done);
				});

				it('sets the `imageUrl` request param to the original image URL corresponding', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, origamiService.mockRequest.params.originalImageUrl);
				});
			});

			describe('when neither the v1, v2 API can find the image and the original image url does not exist', () => {
        const imageUuid = generateUuid();
				let responseError;
				let nockScopeForV1Images;
				let nockScopeForV2Images;
				let nockScopeForFallback;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;
					log.info.resetHistory();

					nockScopeForFallback = nock('http://test.example').persist();
					nockScopeForFallback.head('/image.jpg').reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV1Images = nock('https://im.ft-static.com').persist();
					nockScopeForV1Images.head(`/content/images/${imageUuid}.img`).reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					nockScopeForV2Images = nock('https://prod-upp-image-read.ft.com').persist();
					nockScopeForV2Images.head(`/${imageUuid}`).reply(404, 'I am an svg file', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a 404 error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, `Unable to get image ${imageUuid} from Content API v1 or v2`);
					assert.strictEqual(responseError.status, 404);
					assert.strictEqual(responseError.cacheMaxAge, '5m');
				});

				it('logs that the CMS ID was found in neither API', () => {
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, `ftcms-check cmsId=${imageUuid} cmsVersionUsed=v2 source=mock-source`);
					assert.neverCalledWith(origamiService.mockApp.ft.log.info, `ftcms-check cmsId=${imageUuid} cmsVersionUsed=v1 source=mock-source`);
					assert.calledWithExactly(origamiService.mockApp.ft.log.info, `ftcms-check cmsId=${imageUuid} cmsVersionUsed=error source=mock-source`);
				});

			});

			describe('when the ftcms URL has a querystring', () => {
        const imageUuid = generateUuid();
				const v2Uri = `https://prod-upp-image-read.ft.com/${imageUuid}?foo=bar`;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}?foo=bar`;
					scope = nock('https://prod-upp-image-read.ft.com').persist();
					scope.head(`/${imageUuid}?foo=bar`).reply(200, 'I am an svg file', {
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
        const imageUuid = generateUuid();
				let responseError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;

					scope = nock('https://prod-upp-image-read.ft.com').persist();
					scope.head(`/${imageUuid}`).replyWithError(new Error('mock error'));

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
        const imageUuid = generateUuid();
				let dnsError;
				let responseError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;

					// V2 errors
					dnsError = new Error('mock error');
					dnsError.code = 'ENOTFOUND';
					scope = nock('https://prod-upp-image-read.ft.com').persist();
					scope.head(`/${imageUuid}`).replyWithError(dnsError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, `DNS lookup failed for "https://prod-upp-image-read.ft.com/${imageUuid}"`);
				});

			});

			describe('when the request connection resets', () => {
        const imageUuid = generateUuid();
				let resetError;
				let responseError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;

					// V2 errors
					resetError = new Error('mock error');
					resetError.code = 'ECONNRESET';
					scope = nock('https://prod-upp-image-read.ft.com').persist();
					scope.head(`/${imageUuid}`).replyWithError(resetError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, `Connection reset when requesting "https://prod-upp-image-read.ft.com/${imageUuid}"`);
				});

			});

			describe('when the request times out', () => {
        const imageUuid = generateUuid();
				let responseError;
				let timeoutError;
				let scope;

				beforeEach(done => {
					origamiService.mockRequest.url = 'mock-url';
					origamiService.mockRequest.params.imageUrl = `ftcms:${imageUuid}`;

					// V2 errors
					timeoutError = new Error('mock error');
					timeoutError.code = 'ETIMEDOUT';
					scope = nock('https://prod-upp-image-read.ft.com').persist();
					scope.head(`/${imageUuid}`).replyWithError(timeoutError);

					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, `Request timed out when requesting "https://prod-upp-image-read.ft.com/${imageUuid}"`);
				});
			});

      describe('throws an error when UUID', () => {
        it('is a random string with dashes', () => {
          const invalidImageUuid = 'not-a-uuid';
          origamiService.mockRequest.params.imageUrl = `ftcms:${invalidImageUuid}`;
          assert.throws(() => middleware(origamiService.mockRequest, origamiService.mockResponse), `Image key ${invalidImageUuid} is invalid`);
        });
        it('is a random numbers with dashes', () => {
          const invalidImageUuid = '11-3333-1221213-5553231341';
          origamiService.mockRequest.params.imageUrl = `ftcms:${invalidImageUuid}`;
          assert.throws(() => middleware(origamiService.mockRequest, origamiService.mockResponse), `Image key ${invalidImageUuid} is invalid`);
        
        });
        it('is a string with special character in it', () => {
          const invalidImageUuid = generateUuid().replace(/./g, '%');
          origamiService.mockRequest.params.imageUrl = `ftcms:${invalidImageUuid}`;
          assert.throws(() => middleware(origamiService.mockRequest, origamiService.mockResponse), `Image key ${invalidImageUuid} is invalid`);
        });

        it('has a random string after valid uuid', () => {
          const invalidImageUuid = `${generateUuid}moreText`;
          origamiService.mockRequest.params.imageUrl = `ftcms:${invalidImageUuid}`;
          assert.throws(() => middleware(origamiService.mockRequest, origamiService.mockResponse), `Image key ${invalidImageUuid} is invalid`);
        });
      });
		});
	});
});
