'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');
require('sinon-as-promised');

describe('lib/middleware/get-cms-url', () => {

	let express;
	let getCmsUrl;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');
		mockery.registerMock('express', express);

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
			let mockFetchResponseV1;
			let mockFetchResponseV2;

			beforeEach(done => {
				express.mockRequest.params[0] = 'ftcms:mock-id';
				mockFetchResponseV1 = {
					url: 'response-url-v1',
					ok: true
				};
				mockFetchResponseV2 = {
					url: 'response-url-v2',
					ok: true
				};
				global.fetch = sinon.stub();
				global.fetch.withArgs('http://im.ft-static.com/content/images/mock-id.img').resolves(mockFetchResponseV1);
				global.fetch.withArgs('http://im.ft-static.com/content/images/mock-id.img?foo=bar').resolves(mockFetchResponseV1);
				global.fetch.withArgs('http://com.ft.imagepublish.prod.s3.amazonaws.com/mock-id').resolves(mockFetchResponseV2);
				global.fetch.withArgs('http://com.ft.imagepublish.prod.s3.amazonaws.com/mock-id?foo=bar').resolves(mockFetchResponseV2);
				middleware(express.mockRequest, express.mockResponse, done);
			});

			it('attempts to fetch the v1 API URL corresponding to the CMS ID', () => {
				assert.calledOnce(global.fetch);
				assert.calledWith(global.fetch, 'http://im.ft-static.com/content/images/mock-id.img');
				assert.deepEqual(global.fetch.firstCall.args[1], {
					method: 'HEAD'
				});
			});

			it('sets the request param (0) to the v1 API URL corresponding to the CMS ID', () => {
				assert.strictEqual(express.mockRequest.params[0], mockFetchResponseV1.url);
			});

			describe('when the v1 API cannot find the image', () => {

				beforeEach(done => {
					global.fetch.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id';
					mockFetchResponseV1.ok = false;
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('attempts to fetch the v2 API URL corresponding to the CMS ID', () => {
					assert.calledTwice(global.fetch);
					assert.calledWith(global.fetch, 'http://com.ft.imagepublish.prod.s3.amazonaws.com/mock-id');
					assert.deepEqual(global.fetch.secondCall.args[1], {
						method: 'HEAD'
					});
				});

				it('sets the request param (0) to the v2 API URL corresponding to the CMS ID', () => {
					assert.strictEqual(express.mockRequest.params[0], mockFetchResponseV2.url);
				});

			});

			describe('when neither the v1 or v2 API can find the image', () => {
				let responseError;

				beforeEach(done => {
					global.fetch.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id';
					mockFetchResponseV1.ok = false;
					mockFetchResponseV2.ok = false;
					middleware(express.mockRequest, express.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with a 404 error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'Unable to get image mock-id from FT CMS v1 or v2');
					assert.strictEqual(responseError.status, 404);
				});

			});

			describe('when the ftcms URL has a querystring', () => {

				beforeEach(done => {
					global.fetch.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id?foo=bar';
					mockFetchResponseV1.ok = false;
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('attempts to fetch the API URLs with the querystring intact', () => {
					assert.calledTwice(global.fetch);
					assert.calledWith(global.fetch, 'http://im.ft-static.com/content/images/mock-id.img?foo=bar');
					assert.deepEqual(global.fetch.secondCall.args[1], {
						method: 'HEAD'
					});
				});

			});

		});

	});

});
