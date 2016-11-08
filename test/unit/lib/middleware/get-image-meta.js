'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/get-image-meta', () => {
	let express;
	let getImageMeta;
	let probe;

	beforeEach(() => {

		express = require('../../mock/n-express.mock');

		probe = sinon.stub();
		mockery.registerMock('probe-image-size', probe);

		getImageMeta = require('../../../../lib/middleware/get-image-meta');
	});

	it('exports a function', () => {
		assert.isFunction(getImageMeta);
	});

	describe('getImageMeta(request, response, next)', () => {
		let mockResult;
		let next;

		beforeEach(() => {

			express.mockRequest.appliedTransform = 'http://example.com/applied-transform';
			express.mockRequest.transform = {
				getDpr: sinon.stub().returns(123)
			};
			express.mockRequest.headers.accept = 'mock-accept';

			mockResult = {
				mime: 'foo/bar',
				length: 123456,
				width: 99,
				height: 88
			};
			probe.yields(null, mockResult);

			next = sinon.spy();
			getImageMeta(express.mockRequest, express.mockResponse, next);
		});

		it('probes the transformed image to get meta data, passing through the Accept header', () => {
			assert.calledOnce(probe);
			assert.calledWith(probe, {
				url: express.mockRequest.appliedTransform,
				headers: {
					Accept: express.mockRequest.headers.accept
				}
			});
		});

		it('sets cache headers to one week', () => {
			assert.calledOnce(express.mockResponse.set);
			assert.calledWith(express.mockResponse.set, {
				'Cache-Control': `public, stale-while-revalidate=604800, max-age=604800`
			});
		});

		it('responds with JSON containing the meta data', () => {
			assert.calledOnce(express.mockResponse.send);
			assert.calledWith(express.mockResponse.send, {
				dpr: 123,
				type: 'foo/bar',
				filesize: 123456,
				width: 99,
				height: 88
			});
		});

		describe('when the transformed image does not have a `dpr` set', () => {

			beforeEach(() => {
				express.mockResponse.send.reset();
				express.mockRequest.transform.getDpr.returns(undefined);
				getImageMeta(express.mockRequest, express.mockResponse, next);
			});

			it('defaults to 1 in the response', () => {
				assert.calledOnce(express.mockResponse.send);
				assert.calledWith(express.mockResponse.send, {
					dpr: 1,
					type: 'foo/bar',
					filesize: 123456,
					width: 99,
					height: 88
				});
			});

		});

		describe('when the probe errors with a code of "ECONTENT"', () => {
			let probeError;

			beforeEach(() => {
				express.mockResponse.send.reset();
				probeError = new Error();
				probeError.code = 'ECONTENT';
				probe.yields(probeError);
				getImageMeta(express.mockRequest, express.mockResponse, next);
			});

			it('calls `next` with a new error', () => {
				assert.calledOnce(next);
				assert.instanceOf(next.firstCall.args[0], Error);
				assert.strictEqual(next.firstCall.args[0].status, 500);
				assert.strictEqual(next.firstCall.args[0].message, 'Metadata could not be extracted from the requested image');
				assert.notStrictEqual(next.firstCall.args[0], probeError);
			});

			it('does not respond', () => {
				assert.notCalled(express.mockResponse.send);
			});

		});

		describe('when the probe errors with a 404 status', () => {
			let probeError;

			beforeEach(() => {
				express.mockResponse.send.reset();
				probeError = new Error();
				probeError.status = 404;
				probe.yields(probeError);
				getImageMeta(express.mockRequest, express.mockResponse, next);
			});

			it('calls `next` with a new 404 error', () => {
				assert.calledOnce(next);
				assert.instanceOf(next.firstCall.args[0], Error);
				assert.strictEqual(next.firstCall.args[0].status, 404);
				assert.notStrictEqual(next.firstCall.args[0], probeError);
			});

			it('does not respond', () => {
				assert.notCalled(express.mockResponse.send);
			});

		});

		describe('when the probe errors with a 400 status', () => {
			let probeError;

			beforeEach(() => {
				express.mockResponse.send.reset();
				probeError = new Error();
				probeError.status = 400;
				probe.yields(probeError);
				getImageMeta(express.mockRequest, express.mockResponse, next);
			});

			it('calls `next` with a new 400 error', () => {
				assert.calledOnce(next);
				assert.instanceOf(next.firstCall.args[0], Error);
				assert.strictEqual(next.firstCall.args[0].status, 400);
				assert.notStrictEqual(next.firstCall.args[0], probeError);
			});

			it('does not respond', () => {
				assert.notCalled(express.mockResponse.send);
			});

		});

		describe('when the probe errors with a 500 status', () => {
			let probeError;

			beforeEach(() => {
				express.mockResponse.send.reset();
				probeError = new Error();
				probeError.status = 500;
				probe.yields(probeError);
				getImageMeta(express.mockRequest, express.mockResponse, next);
			});

			it('calls `next` with the probe error', () => {
				assert.calledOnce(next);
				assert.strictEqual(next.firstCall.args[0], probeError);
			});

			it('does not respond', () => {
				assert.notCalled(express.mockResponse.send);
			});

		});

		describe('when the probe errors with no code or status', () => {
			let probeError;

			beforeEach(() => {
				express.mockResponse.send.reset();
				probeError = new Error();
				probe.yields(probeError);
				getImageMeta(express.mockRequest, express.mockResponse, next);
			});

			it('calls `next` with the probe error', () => {
				assert.calledOnce(next);
				assert.strictEqual(next.firstCall.args[0], probeError);
			});

			it('does not respond', () => {
				assert.notCalled(express.mockResponse.send);
			});

		});

	});

});
