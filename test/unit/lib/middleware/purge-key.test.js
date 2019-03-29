'use strict';

const assert = require('proclaim');
const mockery = require('mockery');


describe('lib/middleware/purge-key', () => {
	let origamiService;
	let purgeUrl;
	let FastlyPurge;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		FastlyPurge = require('../../mock/fastly-purge.mock');
		mockery.registerMock('fastly-purge', FastlyPurge);

		purgeUrl = require('../../../../lib/middleware/purge-key');
	});

	it('exports a function', () => {
		assert.isFunction(purgeUrl);
	});

	describe('purgeUrl(config)', () => {
		let middleware;
		let config;
		beforeEach(() => {
			config = {
				fastlyApiKey: 'api-key',
				fastlyServiceId: 'service-id'
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
			const key = 'remove-all-images';

			describe('when the request does not specify a key to purge', () => {
				it('calls `next` with a 400 error', () => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

					assert.notCalled(FastlyPurge.mockInstance.key);
					assert.called(origamiService.mockNext);

					const error = origamiService.mockNext.firstCall.args[0];
					assert.instanceOf(error, Error);
					assert.strictEqual(error.status, 400);
					assert.strictEqual(error.message, 'Please add the key you want to purge as the value to the query parameter `key`. E.G. `/purge/key?key=`');
				});
			});

			describe('when the request specifies a key to purge', () => {
				describe('when the key is purgeable', () => {
					it('responds with a 200 response', () => {
						FastlyPurge.mockInstance.key.yields();
						origamiService.mockRequest.query.key = key;

						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

						assert.called(FastlyPurge.mockInstance.key);
						assert.notCalled(origamiService.mockNext);
						assert.calledWithExactly(origamiService.mockResponse.status, 200);
						assert.calledWithExactly(origamiService.mockResponse.send, `Purged ${key}`);
					});
				});

				describe('when the key is not purgeable', () => {
					it('calls `next` with a 500 error', () => {
						FastlyPurge.mockInstance.key.yields(Error('Something broke!'));
						origamiService.mockRequest.query.key = key;

						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

						assert.called(FastlyPurge.mockInstance.key);
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
