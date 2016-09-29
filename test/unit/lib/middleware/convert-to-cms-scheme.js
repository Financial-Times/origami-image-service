'use strict';

const assert = require('chai').assert;
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

			describe('when the request param (0) does not point to a known CMS image store', () => {

				beforeEach(done => {
					express.mockRequest.params[0] = 'http://foo.bar/image.jpg';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('does nothing to the request param (0)', () => {
					assert.strictEqual(express.mockRequest.params[0], 'http://foo.bar/image.jpg');
				});

			});

			describe('when the request param (0) points to an image in the imagepublish S3 bucket', () => {

				beforeEach(done => {
					express.mockRequest.params[0] = 'https://com.ft.imagepublish.prod.s3.amazonaws.com/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the request param (0) to an `ftcms` URL with the image ID', () => {
					assert.strictEqual(express.mockRequest.params[0], 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef');
				});

			});

			describe('when the request param (0) points to an image on im.ft-static.com', () => {

				beforeEach(done => {
					express.mockRequest.params[0] = 'https://im.ft-static.com/content/images/d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef.img';
					middleware(express.mockRequest, express.mockResponse, done);
				});

				it('sets the request param (0) to an `ftcms` URL with the image ID', () => {
					assert.strictEqual(express.mockRequest.params[0], 'ftcms:d4e0c8c7-adb0-4171-bc98-e01a7d07d7ef');
				});

			});

		});

	});

});
