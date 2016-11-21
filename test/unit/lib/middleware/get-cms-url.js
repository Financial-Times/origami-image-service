'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
require('sinon-as-promised');

describe('lib/middleware/get-cms-url', () => {
	let express;
	let getCmsUrl;
	let requestPromise;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');
		mockery.registerMock('express', express);

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
				express.mockRequest.params.imageUrl = 'ftcms:mock-id';

				// V2 responds with success
				requestPromise.withArgs({
					uri: v2Uri,
					method: 'HEAD'
				}).resolves({
					statusCode: 200
				});

				middleware(express.mockRequest, express.mockResponse, done);
			});

			it('attempts to fetch the v2 API URL corresponding to the CMS ID', () => {
				assert.calledOnce(requestPromise);
				assert.calledWith(requestPromise, {
					uri: v2Uri,
					method: 'HEAD'
				});
			});

			it('sets the `imageUrl` request param to the v2 API URL corresponding to the CMS ID', () => {
				assert.strictEqual(express.mockRequest.params.imageUrl, v2Uri);
			});

			describe('when the v2 API cannot find the image', () => {

				beforeEach(done => {
					requestPromise.reset();
					express.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 responds with a 404
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD'
					}).resolves({
						statusCode: 404
					});

					// V1 responds with success
					requestPromise.withArgs({
						uri: v1Uri,
						method: 'HEAD'
					}).resolves({
						statusCode: 200
					});

					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('attempts to fetch the v1 API URL corresponding to the CMS ID', () => {
					assert.calledTwice(requestPromise);
					assert.calledWith(requestPromise, {
						uri: v1Uri,
						method: 'HEAD'
					});
				});

				it('sets the `imageUrl` request param to the v1 API URL corresponding to the CMS ID', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, v1Uri);
				});

			});

			describe('when neither the v1 or v2 API can find the image', () => {
				let responseError;

				beforeEach(done => {
					requestPromise.reset();
					express.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 responds with a 404
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD'
					}).resolves({
						statusCode: 404
					});

					// V1 responds with a 404
					requestPromise.withArgs({
						uri: v1Uri,
						method: 'HEAD'
					}).resolves({
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
					requestPromise.reset();
					express.mockRequest.params.imageUrl = 'ftcms:mock-id?foo=bar';

					// V2 responds with success
					requestPromise.withArgs({
						uri: `${v2Uri}?foo=bar`,
						method: 'HEAD'
					}).resolves({
						statusCode: 200
					});

					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('attempts to fetch the API URLs with the querystring intact', () => {
					assert.calledOnce(requestPromise);
					assert.calledWith(requestPromise, {
						uri: `${v2Uri}?foo=bar`,
						method: 'HEAD'
					});
				});

			});

			describe('when the URL is not an ftcms URL', () => {

				beforeEach(done => {
					requestPromise.reset();
					express.mockRequest.params.imageUrl = 'http://foo/bar';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('does not touch the `imageUrl` request param', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'http://foo/bar');
				});

			});

			describe('when the request errors', () => {
				let responseError;

				beforeEach(done => {
					requestPromise.reset();
					express.mockRequest.params.imageUrl = 'ftcms:mock-id';

					// V2 errors
					requestPromise.withArgs({
						uri: v2Uri,
						method: 'HEAD'
					}).rejects(new Error('mock error'));

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
