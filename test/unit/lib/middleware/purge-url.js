'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
require('sinon-as-promised');

describe('lib/middleware/purge-url', () => {
	let origamiService;
	let purgeUrl;
	let FastlyPurge;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		FastlyPurge = require('../../mock/fastly-purge.mock');
		mockery.registerMock('fastly-purge', FastlyPurge);

		purgeUrl = require('../../../../lib/middleware/purge-url');
	});

	it('exports a function', () => {
		assert.isFunction(purgeUrl);
	});

	describe('purgeUrl(config)', () => {
		let middleware;
		let config;
		beforeEach(() => {
			config = {
				fastlyApiKey: 'api-key'
			};

			middleware = purgeUrl(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		it('constructs a FastlyPurge instance with soft-purging enabled', () => {
			assert.calledWith(FastlyPurge, config.fastlyApiKey, {
				softPurge: true
			});
		});

		describe('middleware(request, response, next)', () => {
			const url = 'http://im.ft-static.com/content/images/mock-id.img';

			describe('when the request does not specify a url to purge', () => {
				it('calls `next` with a 400 error', () => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

					assert.notCalled(FastlyPurge.mockInstance.url);
					assert.called(origamiService.mockNext);

					const error = origamiService.mockNext.firstCall.args[0];
					assert.instanceOf(error, Error);
					assert.strictEqual(error.status, 400);
					assert.strictEqual(error.message, 'Please url-encode the url you want to purge and add it as the value to the query parameter `url`. E.G. `/purge/url?url=`');
				});
			});

			describe('when the request specifies a url to purge', () => {
				describe('when the url is purgeable', () => {
					it('responds with a 200 response', () => {
						FastlyPurge.mockInstance.url.yields();
						origamiService.mockRequest.query.url = encodeURIComponent(url);

						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

						assert.called(FastlyPurge.mockInstance.url);
						assert.notCalled(origamiService.mockNext);
						assert.calledWithExactly(origamiService.mockResponse.status, 200);
						assert.calledWithExactly(origamiService.mockResponse.send, `Purged ${url}`);
					});
				});

				describe('when the url is not purgeable', () => {
					it('calls `next` with a 500 error', () => {
						FastlyPurge.mockInstance.url.yields(Error('Something broke!'));
						origamiService.mockRequest.query.url = encodeURIComponent(url);

						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

						assert.called(FastlyPurge.mockInstance.url);
						assert.called(origamiService.mockNext);

						const error = origamiService.mockNext.firstCall.args[0];
						assert.instanceOf(error, Error);
						assert.strictEqual(error.status, 500);
						assert.strictEqual(error.message, 'Something broke!');
					});
				});
			});
		});
	});
});
