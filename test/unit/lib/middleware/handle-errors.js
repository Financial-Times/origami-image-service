'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/middleware/handle-errors', () => {
	let express;
	let handleErrors;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');

		handleErrors = require('../../../../lib/middleware/handle-errors');
	});

	it('exports a function', () => {
		assert.isFunction(handleErrors);
	});

	describe('handleErrors(config)', () => {
		let config;
		let middleware;

		beforeEach(() => {
			config = {
				environment: 'development',
				log: {
					error: sinon.spy()
				}
			};
			middleware = handleErrors(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(error, request, response, next)', () => {
			let error;
			let next;

			beforeEach(() => {
				error = new Error('test error');
				error.status = 123;
				next = sinon.spy();
				middleware(error, express.mockRequest, express.mockResponse, next);
			});

			it('sets the response status to the error status', () => {
				assert.calledOnce(express.mockResponse.status);
				assert.calledWithExactly(express.mockResponse.status, 123);
			});

			it('renders a view that represents the error', () => {
				assert.calledOnce(express.mockResponse.render);
				assert.calledWith(express.mockResponse.render, 'error');
				assert.deepEqual(express.mockResponse.render.firstCall.args[1], {
					layout: 'main',
					title: 'Error 123',
					message: 'test error',
					explanation: ''
				});
			});

			describe('with a 4xx error', () => {

				beforeEach(() => {
					error.status = 400;
					config.log.error.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('does not log the error message', () => {
					assert.neverCalledWith(config.log.error, error.message);
				});

			});

			describe('with a 5xx error', () => {

				beforeEach(() => {
					error.status = 500;
					config.log.error.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('logs the error message', () => {
					assert.calledWithExactly(config.log.error, error.message);
				});

			});

			describe('when the error has no `status` property', () => {

				beforeEach(() => {
					delete error.status;
					express.mockResponse.status.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('sets the response status to 500', () => {
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.status, 500);
				});

			});

			describe('when the error has a `code` property set to "ENOTFOUND"', () => {

				beforeEach(() => {
					delete error.status;
					delete error.message;
					error.code = 'ENOTFOUND';
					express.mockResponse.status.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('sets the response status to 502', () => {
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.status, 502);
				});

				it('sets the error message to "Bad Gateway"', () => {
					assert.strictEqual(error.message, 'Bad Gateway');
				});

			});

		});

	});

});
