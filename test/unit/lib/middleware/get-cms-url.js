'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
require('sinon-as-promised');

describe('lib/middleware/get-cms-url', () => {
	let express;
	let getCmsUrl;
	let request;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');
		mockery.registerMock('express', express);

		request = require('../../mock/request.mock');
		mockery.registerMock('request', request);

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
			const v2Uri = 'http://com.ft.imagepublish.prod.s3.amazonaws.com/mock-id';

			beforeEach(done => {
				express.mockRequest.params[0] = 'ftcms:mock-id';

				// V1 responds with success
				request.withArgs({
					uri: v1Uri,
					method: 'HEAD'
				}).yieldsAsync(null, {
					statusCode: 200
				});

				middleware(express.mockRequest, express.mockResponse, done);
			});

			it('attempts to fetch the v1 API URL corresponding to the CMS ID', () => {
				assert.calledOnce(request);
				assert.calledWith(request, {
					uri: v1Uri,
					method: 'HEAD'
				});
			});

			it('sets the request param (0) to the v1 API URL corresponding to the CMS ID', () => {
				assert.strictEqual(express.mockRequest.params[0], v1Uri);
			});

			describe('when the v1 API cannot find the image', () => {

				beforeEach(done => {
					request.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id';

					// V1 responds with a 404
					request.withArgs({
						uri: v1Uri,
						method: 'HEAD'
					}).yieldsAsync(null, {
						statusCode: 404
					});

					// V2 responds with success
					request.withArgs({
						uri: v2Uri,
						method: 'HEAD'
					}).yieldsAsync(null, {
						statusCode: 200
					});

					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('attempts to fetch the v2 API URL corresponding to the CMS ID', () => {
					assert.calledTwice(request);
					assert.calledWith(request, {
						uri: v2Uri,
						method: 'HEAD'
					});
				});

				it('sets the request param (0) to the v2 API URL corresponding to the CMS ID', () => {
					assert.strictEqual(express.mockRequest.params[0], v2Uri);
				});

			});

			describe('when neither the v1 or v2 API can find the image', () => {
				let responseError;

				beforeEach(done => {
					request.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id';

					// V1 responds with a 404
					request.withArgs({
						uri: v1Uri,
						method: 'HEAD'
					}).yieldsAsync(null, {
						statusCode: 404
					});

					// V2 responds with a 404
					request.withArgs({
						uri: v2Uri,
						method: 'HEAD'
					}).yieldsAsync(null, {
						statusCode: 404
					});

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
					request.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id?foo=bar';

					// V1 responds with success
					request.withArgs({
						uri: `${v1Uri}?foo=bar`,
						method: 'HEAD'
					}).yieldsAsync(null, {
						statusCode: 200
					});

					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('attempts to fetch the API URLs with the querystring intact', () => {
					assert.calledOnce(request);
					assert.calledWith(request, {
						uri: `${v1Uri}?foo=bar`,
						method: 'HEAD'
					});
				});

			});

			describe('when the request errors', () => {
				let responseError;

				beforeEach(done => {
					request.reset();
					express.mockRequest.params[0] = 'ftcms:mock-id';

					// V1 errors
					request.withArgs({
						uri: v1Uri,
						method: 'HEAD'
					}).yieldsAsync(new Error('mock error'));

					middleware(express.mockRequest, express.mockResponse, error => {
						responseError = error;
						done();
					});
				});

				it('calls `next` with an error', () => {
					assert.instanceOf(responseError, Error);
					assert.strictEqual(responseError.message, 'mock error');
				});

			});

		});

	});

});
