'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/map-custom-scheme', () => {
	let clock;
	let currentWeekNumber;
	let express;
	let ImageTransform;
	let mapCustomScheme;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');

		ImageTransform = {
			resolveCustomSchemeUri: sinon.stub()
		};
		mockery.registerMock('../image-transform', ImageTransform);

		currentWeekNumber = sinon.stub().returns(1);
		mockery.registerMock('current-week-number', currentWeekNumber);

		clock = sinon.useFakeTimers();

		mapCustomScheme = require('../../../../lib/middleware/map-custom-scheme');
	});

	afterEach(() => {
		clock.restore();
	});

	it('exports a function', () => {
		assert.isFunction(mapCustomScheme);
	});

	describe('mapCustomScheme(config)', () => {
		let config;
		let middleware;

		beforeEach(() => {
			config = {
				customSchemeStore: 'mock-store'
			};
			middleware = mapCustomScheme(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				express.mockRequest.params[0] = 'foo:bar';
				ImageTransform.resolveCustomSchemeUri.returns('http://mock-store/foo/bar.svg');
				middleware(express.mockRequest, express.mockResponse, next);
			});

			it('calls `ImageTransform.resolveCustomSchemeUri` with the request param (0), the configured base URL, and a cache-buster', () => {
				assert.calledOnce(ImageTransform.resolveCustomSchemeUri);
				assert.calledWithExactly(ImageTransform.resolveCustomSchemeUri, 'foo:bar', 'mock-store', '1970-W1-1');
			});

			it('sets the request param (0) to the returned URL', () => {
				assert.strictEqual(express.mockRequest.params[0], ImageTransform.resolveCustomSchemeUri.firstCall.returnValue);
			});

			it('sets the `format` query parameter to the resolved URLs file extension', () => {
				assert.strictEqual(express.mockRequest.query.format, 'svg');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when `ImageTransform.resolveCustomSchemeUri` returns the original URL untouched', () => {

				beforeEach(() => {
					next.reset();
					express.mockRequest.params[0] = 'foo:bar';
					delete express.mockRequest.query.format;
					ImageTransform.resolveCustomSchemeUri.returns(express.mockRequest.params[0]);
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('does not change the request param (0)', () => {
					assert.strictEqual(express.mockRequest.params[0], 'foo:bar');
				});

				it('does not change the `format` query parameter', () => {
					assert.isUndefined(express.mockRequest.query.format);
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the `format` query parameter is already set', () => {

				beforeEach(() => {
					next.reset();
					express.mockRequest.params[0] = 'foo:bar';
					express.mockRequest.query.format = 'foo';
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('does not change the `format` query parameter', () => {
					assert.strictEqual(express.mockRequest.query.format, 'foo');
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the resolved URL does not have a valid extension', () => {

				beforeEach(() => {
					next.reset();
					express.mockRequest.params[0] = 'foo:bar';
					delete express.mockRequest.query.format;
					ImageTransform.resolveCustomSchemeUri.returns('http://mock-store/foo/bar.img');
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('does not set the `format` query parameter', () => {
					assert.isUndefined(express.mockRequest.query.format);
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the resolved URL has a querystring', () => {

				beforeEach(() => {
					next.reset();
					express.mockRequest.params[0] = 'foo:bar';
					delete express.mockRequest.query.format;
					ImageTransform.resolveCustomSchemeUri.returns('http://mock-store/foo/bar.svg?foo=bar');
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('sets the request param (0) to the returned URL', () => {
					assert.strictEqual(express.mockRequest.params[0], 'http://mock-store/foo/bar.svg?foo=bar');
				});

				it('sets the `format` query parameter to the resolved URLs file extension', () => {
					assert.strictEqual(express.mockRequest.query.format, 'svg');
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when `ImageTransform.resolveCustomSchemeUri` throws', () => {
				let resolutionError;

				beforeEach(() => {
					next.reset();
					resolutionError = new Error('resolution error');
					ImageTransform.resolveCustomSchemeUri.throws(resolutionError);
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('sets the error status to 400', () => {
					assert.strictEqual(resolutionError.status, 400);
				});

				it('calls `next` with the error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, resolutionError);
				});

			});

		});

	});

});
