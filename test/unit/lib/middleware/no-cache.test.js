'use strict';

const assert = require('proclaim');


describe('lib/middleware/no-cache', () => {
	let origamiService;
	let noCache;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		noCache = require('../../../../lib/middleware/no-cache');
	});

	it('exports a function', () => {
		assert.isFunction(noCache);
	});

	describe('noCache()', () => {
		let middleware;

		beforeEach(() => {
			middleware = noCache();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {

			let middleware;

			beforeEach(() => {
				middleware = noCache();
			});

			it('set Cache-Control header to not cache', () => {
				middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);
				assert.calledWithExactly(origamiService.mockResponse.set, 'Cache-Control', 'private, max-age=0, no-cache');
			});

			it('set Surrogate-Control to not cache', () => {
				middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);
				assert.calledWithExactly(origamiService.mockResponse.set, 'Surrogate-Control', 'private, max-age=0, no-cache');
			});

			it('calls `next`', () => {
				middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);
				assert.called(origamiService.mockNext);
			});
		});
	});
});