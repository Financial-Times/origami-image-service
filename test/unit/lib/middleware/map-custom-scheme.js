'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/map-custom-scheme', () => {
	let clock;
	let currentWeekNumber;
	let ImageTransform;
	let mapCustomScheme;
	let origamiService;

	beforeEach(() => {
		ImageTransform = {
			resolveCustomSchemeUri: sinon.stub()
		};
		mockery.registerMock('../image-transform', ImageTransform);

		currentWeekNumber = sinon.stub().returns(1);
		mockery.registerMock('current-week-number', currentWeekNumber);

		clock = sinon.useFakeTimers();

		origamiService = require('../../mock/origami-service.mock');

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
				customSchemeStore: 'mock-store',
				customSchemeCacheBust: 'mock-bust'
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
				origamiService.mockRequest.params.imageUrl = 'foo:bar';
				ImageTransform.resolveCustomSchemeUri.returns('http://mock-store/foo/bar.svg');
				middleware(origamiService.mockRequest, origamiService.mockResponse, next);
			});

			it('calls `ImageTransform.resolveCustomSchemeUri` with the `imageUrl` request param, the configured base URL, and a cache-buster', () => {
				assert.calledOnce(ImageTransform.resolveCustomSchemeUri);
				assert.calledWithExactly(ImageTransform.resolveCustomSchemeUri, 'foo:bar', 'mock-store', '1970-W1-1+mock-bust');
			});

			it('sets the `imageUrl` request param to the returned URL', () => {
				assert.strictEqual(origamiService.mockRequest.params.imageUrl, ImageTransform.resolveCustomSchemeUri.firstCall.returnValue);
			});

			it('sets the `format` query parameter to the resolved URLs file extension', () => {
				assert.strictEqual(origamiService.mockRequest.query.format, 'svg');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when `ImageTransform.resolveCustomSchemeUri` returns the original URL untouched', () => {

				beforeEach(() => {
					next.reset();
					origamiService.mockRequest.params.imageUrl = 'foo:bar';
					delete origamiService.mockRequest.query.format;
					ImageTransform.resolveCustomSchemeUri.returns(origamiService.mockRequest.params.imageUrl);
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('does not change the `imageUrl` request param', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, 'foo:bar');
				});

				it('does not change the `format` query parameter', () => {
					assert.isUndefined(origamiService.mockRequest.query.format);
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the `format` query parameter is already set', () => {

				beforeEach(() => {
					next.reset();
					origamiService.mockRequest.params.imageUrl = 'foo:bar';
					origamiService.mockRequest.query.format = 'foo';
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('does not change the `format` query parameter', () => {
					assert.strictEqual(origamiService.mockRequest.query.format, 'foo');
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the resolved URL does not have a valid extension', () => {

				beforeEach(() => {
					next.reset();
					origamiService.mockRequest.params.imageUrl = 'foo:bar';
					delete origamiService.mockRequest.query.format;
					ImageTransform.resolveCustomSchemeUri.returns('http://mock-store/foo/bar.img');
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('does not set the `format` query parameter', () => {
					assert.isUndefined(origamiService.mockRequest.query.format);
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the resolved URL has a querystring', () => {

				beforeEach(() => {
					next.reset();
					origamiService.mockRequest.params.imageUrl = 'foo:bar';
					delete origamiService.mockRequest.query.format;
					ImageTransform.resolveCustomSchemeUri.returns('http://mock-store/foo/bar.svg?foo=bar');
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the `imageUrl` request param to the returned URL', () => {
					assert.strictEqual(origamiService.mockRequest.params.imageUrl, 'http://mock-store/foo/bar.svg?foo=bar');
				});

				it('sets the `format` query parameter to the resolved URLs file extension', () => {
					assert.strictEqual(origamiService.mockRequest.query.format, 'svg');
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
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
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
