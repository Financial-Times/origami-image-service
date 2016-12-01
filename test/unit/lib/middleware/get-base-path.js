'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/middleware/get-base-path', () => {
	let express;
	let getBasePath;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');

		getBasePath = require('../../../../lib/middleware/get-base-path');
	});

	it('exports a function', () => {
		assert.isFunction(getBasePath);
	});

	describe('getBasePath(request, response, next)', () => {
		let next;

		beforeEach(() => {
			next = sinon.spy();
			getBasePath(express.mockRequest, express.mockResponse, next);
		});

		it('sets `request.basePath` to "/"', () => {
			assert.strictEqual(express.mockRequest.basePath, '/');
		});

		it('sets `response.locals.basePath` to "/"', () => {
			assert.strictEqual(express.mockResponse.locals.basePath, '/');
		});

		it('calls `next` with no error', () => {
			assert.calledOnce(next);
			assert.calledWithExactly(next);
		});

		describe('when the request has an `FT-Origami-Service-Base-Path` header', () => {

			beforeEach(() => {
				next.reset();
				express.mockRequest.headers['ft-origami-service-base-path'] = '/foo/bar/';
				getBasePath(express.mockRequest, express.mockResponse, next);
			});

			it('sets `request.basePath` to the header value', () => {
				assert.strictEqual(express.mockRequest.basePath, '/foo/bar/');
			});

			it('sets `response.locals.basePath` to the header value', () => {
				assert.strictEqual(express.mockResponse.locals.basePath, '/foo/bar/');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

		});

		describe('when the `FT-Origami-Service-Base-Path` header does not begin or end with a slash', () => {

			beforeEach(() => {
				next.reset();
				express.mockRequest.headers['ft-origami-service-base-path'] = 'foo/bar';
				getBasePath(express.mockRequest, express.mockResponse, next);
			});

			it('sets `request.basePath` to the header value with slashes added', () => {
				assert.strictEqual(express.mockRequest.basePath, '/foo/bar/');
			});

			it('sets `response.locals.basePath` to the header value with slashes added', () => {
				assert.strictEqual(express.mockResponse.locals.basePath, '/foo/bar/');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

		});

	});

});
