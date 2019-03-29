'use strict';

const assert = require('proclaim');

describe('lib/middleware/api-key', () => {
	let origamiService;
	let apiKey;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		apiKey = require('../../../../lib/middleware/api-key');
	});

	it('exports a function', () => {
		assert.isFunction(apiKey);
	});

	describe('apiKey(config)', () => {
		let config;

		beforeEach(() => {
			config = {
				apiKey: 'api-key'
			};
		});

		it('returns a middleware function', () => {
			assert.isFunction(apiKey());
		});

		describe('middleware(request, response, next)', () => {

			describe('when no app api key is set', () => {
				let middleware;

				beforeEach(() => {
					middleware = apiKey();
				});

				describe('when FT-Origami-Api-Key header is not set', () => {
					it('calls `next`', () => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);
						assert.called(origamiService.mockNext);

						const error = origamiService.mockNext.firstCall.args[0];
						assert.instanceOf(error, Error);
						assert.strictEqual(error.status, 500);
						assert.strictEqual(error.message, 'Application has no registered API keys.');
					});
				});

				describe('when FT-Origami-Api-Key header is set', () => {
					it('calls `next`', () => {
						origamiService.mockRequest.headers['FT-Origami-Api-Key'] = 'abc';
						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);
						assert.called(origamiService.mockNext);

						const error = origamiService.mockNext.firstCall.args[0];
						assert.instanceOf(error, Error);
						assert.strictEqual(error.status, 500);
						assert.strictEqual(error.message, 'Application has no registered API keys.');
					});
				});
			});


			describe('when app api key is set', () => {
				let middleware;

				beforeEach(() => {
					middleware = apiKey(config);
				});

				describe('when FT-Origami-Api-Key header is not set', () => {
					it('calls `next` with a 401 status', () => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

						assert.called(origamiService.mockNext);

						const error = origamiService.mockNext.firstCall.args[0];
						assert.instanceOf(error, Error);
						assert.strictEqual(error.status, 401);
						assert.strictEqual(error.message, 'FT-Origami-Api-Key header does not contain a valid api key.');
					});
				});

				describe('when FT-Origami-Api-Key header is set with correct key', () => {
					it('calls `next`', () => {
						origamiService.mockRequest.get.withArgs('FT-Origami-Api-Key').returns(config.apiKey);
						origamiService.mockRequest.headers['FT-Origami-Api-Key'] = config.apiKey;
						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);
						assert.calledWith(origamiService.mockNext);
					});
				});

				describe('when FT-Origami-Api-Key header is set with incorrect key', () => {
					it('calls `next` with a 401 status', () => {
						origamiService.mockRequest.headers['FT-Origami-Api-Key'] = 'abc';
						middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

						assert.called(origamiService.mockNext);

						const error = origamiService.mockNext.firstCall.args[0];
						assert.instanceOf(error, Error);
						assert.strictEqual(error.status, 401);
						assert.strictEqual(error.message, 'FT-Origami-Api-Key header does not contain a valid api key.');
					});
				});
			});
		});
	});
});