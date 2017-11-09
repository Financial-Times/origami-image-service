'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/response-interceptor', () => {
	let http;
	let responseInterceptor;

	beforeEach(() => {
		http = require('../mock/http.mock');
		responseInterceptor = require('../../../lib/response-interceptor');
	});

	it('is a function', () => {
		assert.isFunction(responseInterceptor);
	});

	describe('responseInterceptor()', () => {
		let options;
		let response;
		let responseBackup;

		beforeEach(() => {
			response = new http.ServerResponse();
			responseBackup = {
				write: response.write,
				writeHead: response.writeHead,
				end: response.end
			};
			options = {
				condition: sinon.stub(),
				write: sinon.spy(),
				writeHead: sinon.spy(),
				end: sinon.spy()
			};
			responseInterceptor(response, options);
		});

		it('replaces the `response.write` method', () => {
			assert.notStrictEqual(response.write, responseBackup.write);
		});

		it('replaces the `response.writeHead` method', () => {
			assert.notStrictEqual(response.writeHead, responseBackup.writeHead);
		});

		it('replaces the `response.end` method', () => {
			assert.notStrictEqual(response.end, responseBackup.end);
		});

		describe('response.write()', () => {

			describe('when `options.condition` returns `false`', () => {

				beforeEach(() => {
					options.condition.returns(false);
					response.write('foo', 'bar');
				});

				it('calls the original `response.write`', () => {
					assert.calledOnce(responseBackup.write);
					assert.calledWithExactly(responseBackup.write, 'foo', 'bar');
					assert.calledOn(responseBackup.write, response);
				});

				it('does not restore the backed up `response.write`', () => {
					assert.notStrictEqual(response.write, responseBackup.write);
				});

			});

			describe('when `options.condition` returns `true`', () => {

				beforeEach(() => {
					options.condition.returns(true);
					response.write('foo', 'bar');
				});

				it('calls `options.write`', () => {
					assert.calledOnce(options.write);
					assert.calledWithExactly(options.write, 'foo', 'bar');
					assert.calledOn(options.write, response);
				});

				it('does not restore the backed up `response.write`', () => {
					assert.notStrictEqual(response.write, responseBackup.write);
				});

				describe('when `options.write` is not set', () => {

					beforeEach(() => {
						delete options.write;
					});

					it('does not throw an error', () => {
						assert.doesNotThrow(() => response.write('foo', 'bar'));
					});

				});

			});

		});

		describe('response.writeHead()', () => {

			describe('when `options.condition` returns `false`', () => {

				beforeEach(() => {
					options.condition.returns(false);
					response.writeHead('foo', 'bar');
				});

				it('calls the original `response.writeHead`', () => {
					assert.calledOnce(responseBackup.writeHead);
					assert.calledWithExactly(responseBackup.writeHead, 'foo', 'bar');
					assert.calledOn(responseBackup.writeHead, response);
				});

				it('does not restore the backed up `response.writeHead`', () => {
					assert.notStrictEqual(response.writeHead, responseBackup.writeHead);
				});

			});

			describe('when `options.condition` returns `true`', () => {

				beforeEach(() => {
					options.condition.returns(true);
					response.writeHead('foo', 'bar');
				});

				it('calls `options.writeHead`', () => {
					assert.calledOnce(options.writeHead);
					assert.calledWithExactly(options.writeHead, 'foo', 'bar');
					assert.calledOn(options.writeHead, response);
				});

				it('does not restore the backed up `response.writeHead`', () => {
					assert.notStrictEqual(response.writeHead, responseBackup.writeHead);
				});

				describe('when `options.writeHead` is not set', () => {

					beforeEach(() => {
						delete options.writeHead;
					});

					it('does not throw an error', () => {
						assert.doesNotThrow(() => response.writeHead('foo', 'bar'));
					});

				});

			});

		});

		describe('response.end()', () => {

			describe('when `options.condition` returns `false`', () => {

				beforeEach(() => {
					options.condition.returns(false);
					response.end('foo', 'bar');
				});

				it('calls the original `response.end`', () => {
					assert.calledOnce(responseBackup.end);
					assert.calledWithExactly(responseBackup.end, 'foo', 'bar');
					assert.calledOn(responseBackup.end, response);
				});

				it('restores the backed up `response.end`', () => {
					assert.strictEqual(response.end, responseBackup.end);
				});

			});

			describe('when `options.condition` returns `true`', () => {

				beforeEach(() => {
					options.condition.returns(true);
					response.end('foo', 'bar');
				});

				it('calls `options.end`', () => {
					assert.calledOnce(options.end);
					assert.calledWithExactly(options.end, 'foo', 'bar');
					assert.calledOn(options.end, response);
				});

				it('restores the backed up `response.end`', () => {
					assert.strictEqual(response.end, responseBackup.end);
				});

				describe('when `options.end` is not set', () => {

					beforeEach(() => {
						delete options.end;
					});

					it('does not throw an error', () => {
						assert.doesNotThrow(() => response.end('foo', 'bar'));
					});

				});

			});

		});

	});

});
