'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

const twitterSVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M417 720c193.2 0 298.9-160.1 298.9-298.9 0-4.5 0-9.1-.3-13.6 20.6-14.9 38.3-33.3 52.4-54.4-19.2 8.5-39.5 14.1-60.3 16.5 21.9-13.1 38.3-33.8 46.2-58.1-20.6 12.2-43.2 20.9-66.7 25.5-39.8-42.3-106.3-44.3-148.6-4.6-27.3 25.7-38.9 63.9-30.4 100.4-84.5-4.2-163.2-44.1-216.5-109.8-27.9 48-13.6 109.4 32.5 140.2-16.7-.5-33.1-5-47.7-13.1v1.3c0 50 35.3 93.1 84.3 103-15.5 4.2-31.7 4.8-47.4 1.8 13.8 42.8 53.2 72.1 98.1 72.9-37.2 29.2-83.1 45.1-130.5 45.1-8.4 0-16.7-.5-25-1.5 48 31 103.9 47.3 161 47.3"></path></svg>`;
const twitterSVGWithOnClickHandler = `<svg onClick="doSomething(); return false;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path d="M417 720c193.2 0 298.9-160.1 298.9-298.9 0-4.5 0-9.1-.3-13.6 20.6-14.9 38.3-33.3 52.4-54.4-19.2 8.5-39.5 14.1-60.3 16.5 21.9-13.1 38.3-33.8 46.2-58.1-20.6 12.2-43.2 20.9-66.7 25.5-39.8-42.3-106.3-44.3-148.6-4.6-27.3 25.7-38.9 63.9-30.4 100.4-84.5-4.2-163.2-44.1-216.5-109.8-27.9 48-13.6 109.4 32.5 140.2-16.7-.5-33.1-5-47.7-13.1v1.3c0 50 35.3 93.1 84.3 103-15.5 4.2-31.7 4.8-47.4 1.8 13.8 42.8 53.2 72.1 98.1 72.9-37.2 29.2-83.1 45.1-130.5 45.1-8.4 0-16.7-.5-25-1.5 48 31 103.9 47.3 161 47.3"/></svg>`;

const nock = require('nock');
const proclaim = require('proclaim');


describe('lib/middleware/handle-svg', function () {
	this.timeout(10 * 1000);

	let origamiService;
	let handleSvg;
	let scope;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');
		handleSvg = require('../../../../lib/middleware/handle-svg');
		scope = nock('https://ft.com').persist();
		scope.get('/twitter.svg').reply(200, twitterSVG, {
			'Content-Type': 'image/svg+xml; charset=utf-8',
		});

		scope.get('/twitter.svg-ECONNRESET').replyWithError({
			message: 'uh oh the connection reset',
			syscall: 'syscall',
			code: 'ECONNRESET',
		});
		scope.get('/twitter.svg-ENOTFOUND').replyWithError({
			message: 'uh oh the domain has no dns record',
			code: 'ENOTFOUND',
		});
		scope.get('/twitter.svg-ETIMEDOUT').replyWithError({
			message: 'uh oh the connection timed out',
			syscall: 'syscall',
			code: 'ETIMEDOUT',
		});
	});

	afterEach(() => {
		nock.cleanAll();
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
			context('when the svg request connection is reset', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://ft.com/twitter.svg-ECONNRESET';
					origamiService.mockRequest.query.color = 'f00';
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});
				it('calls `next` with a descriptive error', () => {
					assert.isTrue(next.calledOnce);
					assert.isInstanceOf(next.firstCall.args[0], Error);
					assert.strictEqual(next.firstCall.args[0].message, 'Connection reset when requesting "https://ft.com/twitter.svg-ECONNRESET" (syscall)');
				});
			});

			context('when the svg request has no DNS entry', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://ft.com/twitter.svg-ENOTFOUND';
					origamiService.mockRequest.query.color = 'f00';
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});
				it('calls `next` with a descriptive error', () => {
					assert.isTrue(next.calledOnce);
					assert.isInstanceOf(next.firstCall.args[0], Error);
					assert.strictEqual(next.firstCall.args[0].message, 'DNS lookup failed for "https://ft.com/twitter.svg-ENOTFOUND"');
				});
			});

			context('when the svg request times out', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://ft.com/twitter.svg-ETIMEDOUT';
					origamiService.mockRequest.query.color = 'f00';
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});

				it('calls `next` with a descriptive error', () => {
					assert.isTrue(next.calledOnce);
					assert.isInstanceOf(next.firstCall.args[0], Error);
					assert.strictEqual(next.firstCall.args[0].message, 'Request timed out when requesting "https://ft.com/twitter.svg-ETIMEDOUT" (syscall)');
				});

			});

			describe('when the image URL is from ft.com/__assets', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://www.ft.com/__assets/twitter.svg';
					const scope = nock('https://www.ft.com').persist();
					scope.get('/__assets/twitter.svg').reply(200, twitterSVGWithOnClickHandler, {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done(error);
					});
				});
				afterEach(() => {
					nock.cleanAll();
				});
				it('does not purify the SVG', () => {
					proclaim.isTrue(origamiService.mockResponse.send.calledOnce);
					proclaim.equal(origamiService.mockResponse.send.firstCall.firstArg, twitterSVGWithOnClickHandler);
				});
			});

			describe('when the image URL is from origami-images.ft.com', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://origami-images.ft.com/twitter.svg';
					const scope = nock('https://origami-images.ft.com').persist();
					scope.get('/twitter.svg').reply(200, twitterSVGWithOnClickHandler, {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done(error);
					});
				});
				afterEach(() => {
					nock.cleanAll();
				});
				it('does not purify the SVG', () => {
					proclaim.isTrue(origamiService.mockResponse.send.calledOnce);
					proclaim.equal(origamiService.mockResponse.send.firstCall.firstArg, twitterSVGWithOnClickHandler);
				});
			});

			describe('when the image URL is not from origami-images.ft.com or ft.com/__assets', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(200, twitterSVGWithOnClickHandler, {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done(error);
					});
				});
				it('does purify the SVG', () => {
					proclaim.isTrue(origamiService.mockResponse.send.calledOnce);
					proclaim.equal(origamiService.mockResponse.send.firstCall.firstArg, twitterSVG);
				});
			});

			describe('when the svg request returns a 404', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(404, 'Not Found.', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});
				it('calls next with an error and sets correct status code', () => {
					assert.isTrue(next.calledOnce);
					assert.equal(next.firstCall.firstArg.status, 404);
					assert.equal(next.firstCall.firstArg.cacheMaxAge, '5m');
				});
			});

			describe('when the svg request returns a 500', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(500, 'Internal Server Error.', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});
				it('calls next with an error and sets correct status code', () => {
					assert.isTrue(next.calledOnce);
					assert.equal(next.firstCall.firstArg.status, 500);
					assert.equal(next.firstCall.firstArg.cacheMaxAge, '5m');
				});
			});

			describe('when the svg request returns a non svg content-type', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(200, 'Hello.', {
						'Content-Type': 'text/plain; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});
				it('calls next with an error and sets correct status code', () => {
					assert.isTrue(next.calledOnce);
					assert.equal(next.firstCall.firstArg.status, 400);
					assert.equal(next.firstCall.firstArg.cacheMaxAge, '5m');
				});
			});

			describe('when `request.query.color` is set', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.query.color = '#FFC0CB';
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(200, twitterSVGWithOnClickHandler, {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done(error);
					});
				});
				it('tints the SVG with the color defined in `request.query.color`', () => {
					proclaim.isTrue(origamiService.mockResponse.send.calledOnce);
					proclaim.include(origamiService.mockResponse.send.firstCall.firstArg, '<style>*{fill:#FFC0CB!important;}</style>');
				});
			});

			describe('when `request.query.color` is not set', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(200, twitterSVGWithOnClickHandler, {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done(error);
					});
				});
				it('does not tint the SVG', () => {
					proclaim.isTrue(origamiService.mockResponse.send.calledOnce);
					proclaim.equal(origamiService.mockResponse.send.firstCall.firstArg, twitterSVG);
				});
			});

			describe('when the SvgTintStream errors', () => {
				let next;
				beforeEach((done) => {
					next = sinon.spy();
					origamiService.mockRequest.query.color = 'not-a-valid-hex-color';
					origamiService.mockRequest.params[0] = 'https://example.com/twitter.svg';
					const scope = nock('https://example.com').persist();
					scope.get('/twitter.svg').reply(200, twitterSVGWithOnClickHandler, {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					origamiService.mockResponse.send.resetHistory();
					const originalMockResponseSendMethod = origamiService.mockResponse.send;
					origamiService.mockResponse.send = function(...args) {
						originalMockResponseSendMethod.apply(undefined, args);
						origamiService.mockResponse.send = originalMockResponseSendMethod;
						done();
					};
					middleware(origamiService.mockRequest, origamiService.mockResponse, error => {
						next(error);
						done();
					});
				});

				it('calls next with the error and sets correct status code', () => {
					assert.isTrue(next.calledOnce);
					assert.equal(next.firstCall.firstArg.status, 400);
					assert.equal(next.firstCall.firstArg.cacheMaxAge, '1y');
				});

			});
		});
	});
});
