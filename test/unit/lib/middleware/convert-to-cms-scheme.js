'use strict';

const assert = require('proclaim');
const mockery = require('mockery');

describe('lib/middleware/convert-to-cms-scheme', () => {
	let convertToCmsScheme;
	let express;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');
		mockery.registerMock('express', express);

		convertToCmsScheme = require('../../../../lib/middleware/convert-to-cms-scheme');
	});

	it('exports a function', () => {
		assert.isFunction(convertToCmsScheme);
	});

	describe('convertToCmsScheme()', () => {
		let middleware;

		beforeEach(() => {
			middleware = convertToCmsScheme();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {

			describe('when the `imageUrl` request param does not point to a known CMS image store', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = 'http://foo.bar/image.jpg';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('does nothing to the `imageUrl` request param', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'http://foo.bar/image.jpg');
				});

			});

			describe('when the `imageUrl` request param points to an image in prod-upp-image-read.ft.com', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = 'http://prod-upp-image-read.ft.com/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the `imageUrl` request param to an `ftcms` URL with the image ID', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef');
				});

			});

			describe('when the `imageUrl` request param points to an image in the imagepublish S3 bucket', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = 'https://com.ft.imagepublish.prod.s3.amazonaws.com/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the `imageUrl` request param to an `ftcms` URL with the image ID', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef');
				});

			});

			describe('when the `imageUrl` request param points to an image in the imagepublish US S3 bucket', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = 'https://com.ft.imagepublish.prod-us.s3.amazonaws.com/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the `imageUrl` request param to an `ftcms` URL with the image ID', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef');
				});

			});

			describe('when the `imageUrl` request param points to an image on im.ft-static.com', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = 'https://im.ft-static.com/content/images/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef.img';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the `imageUrl` request param to an `ftcms` URL with the image ID', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef');
				});

			});

			describe('when the `imageUrl` request param has a querystring', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = 'https://im.ft-static.com/content/images/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef.img?foo=bar';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the `imageUrl` request param to an `ftcms` URL with the query intact', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef?foo=bar');
				});

			});

			describe('when the `imageUrl` request param is a protocol-relative URL', () => {

				beforeEach(done => {
					express.mockRequest.params.imageUrl = '//im.ft-static.com/content/images/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef.img?foo=bar';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the `imageUrl` request param to an `ftcms` URL with the query intact', () => {
					assert.strictEqual(express.mockRequest.params.imageUrl, 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef?foo=bar');
				});

			});

		});

	});

});
