'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');


describe('lib/middleware/handle-svg', () => {
	let origamiService;
	let request;
	let handleSvg;
	let SvgTintStream;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		request = require('../../mock/request.mock');
		mockery.registerMock('request', request);

		// Temporary: not real mocks
		mockery.registerMock('dompurify', {});
		mockery.registerMock('jsdom', {});

		SvgTintStream = require('../../mock/svg-tint-stream.mock');
		mockery.registerMock('svg-tint-stream', SvgTintStream);

		handleSvg = require('../../../../lib/middleware/handle-svg');
	});

	it('exports a function', () => {
		assert.isFunction(handleSvg);
	});

	describe('handleSvg()', () => {
		let middleware;

		beforeEach(() => {
			middleware = handleSvg();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				origamiService.mockRequest.params[0] = 'mock-uri';
				origamiService.mockRequest.query.color = 'f00';
				middleware(origamiService.mockRequest, origamiService.mockResponse, next);
			});

			it('creates an SVG tint stream with `request.query.color`', () => {
				assert.calledOnce(SvgTintStream);
				assert.calledWithNew(SvgTintStream);
				assert.calledWith(SvgTintStream, {
					color: origamiService.mockRequest.query.color,
					stroke: false
				});
			});

			it('creates an HTTP request stream with `request.params[0]`', () => {
				assert.calledOnce(request);
				assert.calledWith(request, origamiService.mockRequest.params[0], {
					timeout: 25000
				});
			});

			it('binds a handler to the HTTP request stream "response" event', () => {
				assert.calledWith(request.mockStream.on, 'response');
			});

			describe('HTTP request stream "response" handler', () => {
				let handler;
				let mockImageResponse;

				beforeEach(() => {
					mockImageResponse = {
						statusCode: 200,
						headers: {
							'content-type': 'image/svg+xml'
						}
					};
					handler = request.mockStream.on.withArgs('response').firstCall.args[1];
					handler(mockImageResponse);
				});

				it('sets the Content-Type header to the SVG content type', () => {
					assert.calledOnce(origamiService.mockResponse.set);
					assert.calledWithExactly(origamiService.mockResponse.set, 'Content-Type', 'image/svg+xml; charset=utf-8');
				});

				describe('when the image response status is an error code', () => {

					beforeEach(() => {
						origamiService.mockResponse.set.resetHistory();
						mockImageResponse.statusCode = 400;
						handler(mockImageResponse);
					});

					it('does not set the Content-Type header', () => {
						assert.notCalled(origamiService.mockResponse.set);
					});

					it('emits an error on the HTTP request stream', () => {
						assert.calledOnce(request.mockStream.emit);
						assert.calledWith(request.mockStream.emit, 'error');
						assert.instanceOf(request.mockStream.emit.firstCall.args[1], Error);
						assert.strictEqual(request.mockStream.emit.firstCall.args[1].status, 400);
						assert.strictEqual(request.mockStream.emit.firstCall.args[1].cacheMaxAge, '30s');
						assert.strictEqual(request.mockStream.emit.firstCall.args[1].message, 'Bad Request');
					});

				});

				describe('when the image response is not an SVG', () => {

					beforeEach(() => {
						origamiService.mockResponse.set.resetHistory();
						mockImageResponse.headers['content-type'] = 'text/html';
						handler(mockImageResponse);
					});

					it('does not set the Content-Type header', () => {
						assert.notCalled(origamiService.mockResponse.set);
					});

					it('emits an error on the HTTP request stream', () => {
						assert.calledOnce(request.mockStream.emit);
						assert.calledWith(request.mockStream.emit, 'error');
						assert.instanceOf(request.mockStream.emit.firstCall.args[1], Error);
						assert.strictEqual(request.mockStream.emit.firstCall.args[1].status, 400);
						assert.strictEqual(request.mockStream.emit.firstCall.args[1].cacheMaxAge, '5m');
						assert.strictEqual(request.mockStream.emit.firstCall.args[1].message, 'URI must point to an SVG image');
					});

				});

			});

			it('binds a handler to the HTTP request stream "error" event', () => {
				assert.calledWith(request.mockStream.on, 'error');
			});

			describe('HTTP request stream "error" handler', () => {
				let handler;
				let streamError;

				beforeEach(() => {
					streamError = new Error('mock error');
					handler = request.mockStream.on.withArgs('error').firstCall.args[1];
					handler(streamError);
				});

				it('calls `next` with the error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, streamError);
				});

				describe('when the error represents a failed DNS lookup', () => {
					let dnsError;

					beforeEach(() => {
						next.resetHistory();
						dnsError = new Error('mock error');
						dnsError.code = 'ENOTFOUND';
						dnsError.syscall = 'getaddrinfo';
						handler(dnsError);
					});

					it('calls `next` with a descriptive error', () => {
						assert.calledOnce(next);
						assert.instanceOf(next.firstCall.args[0], Error);
						assert.strictEqual(next.firstCall.args[0].message, 'DNS lookup failed for "mock-uri"');
					});

				});

				describe('when the error represents a connection reset', () => {
					let resetError;

					beforeEach(() => {
						next.resetHistory();
						resetError = new Error('mock error');
						resetError.code = 'ECONNRESET';
						resetError.syscall = 'mock-syscall';
						handler(resetError);
					});

					it('calls `next` with a descriptive error', () => {
						assert.calledOnce(next);
						assert.instanceOf(next.firstCall.args[0], Error);
						assert.strictEqual(next.firstCall.args[0].message, 'Connection reset when requesting "mock-uri" (mock-syscall)');
					});

				});

				describe('when the error represents a request timeout', () => {
					let resetError;

					beforeEach(() => {
						next.resetHistory();
						resetError = new Error('mock error');
						resetError.code = 'ETIMEDOUT';
						resetError.syscall = 'mock-syscall';
						handler(resetError);
					});

					it('calls `next` with a descriptive error', () => {
						assert.calledOnce(next);
						assert.instanceOf(next.firstCall.args[0], Error);
						assert.strictEqual(next.firstCall.args[0].message, 'Request timed out when requesting "mock-uri" (mock-syscall)');
					});

				});

			});

			// Temporarily skipped until we write tests for the latest fix
			it.skip('pipes the HTTP request stream through the tint stream and into the response', () => {
				assert.calledWithExactly(request.mockStream.pipe, SvgTintStream.mockStream);
				assert.calledWithExactly(request.mockStream.pipe, origamiService.mockResponse);
				assert.callOrder(
					request.mockStream.pipe.withArgs(SvgTintStream.mockStream),
					request.mockStream.pipe.withArgs(origamiService.mockResponse)
				);
			});

			describe('when `request.query.color` is not set', () => {

				beforeEach(() => {
					SvgTintStream.resetHistory();
					delete origamiService.mockRequest.query.color;
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('does not create an SVG tint stream', () => {
					assert.notCalled(SvgTintStream);
				});

			});

			describe('when the SvgTintStream errors', () => {
				let tintError;

				beforeEach(() => {
					next.resetHistory();
					tintError = new Error('stream error');
					SvgTintStream.throws(tintError);
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 400', () => {
					assert.strictEqual(tintError.status, 400);
				});

				it('calls `next` with the error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, tintError);
				});

			});

		});

	});

});
