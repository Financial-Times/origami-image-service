'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/purge-from-fastly', () => {
	let FastlyPurge;
	let addHours;
	let startOfHour;
	let getHours;
	let differenceInMilliseconds;
	let purgeFromFastly;
	let url;
	let key;

	beforeEach(() => {
		key = 'key';

		url = 'http://www.ft.com/__origami/service/images/v2/images/raw/https://www.example.com/cats.png?source=test';

		FastlyPurge = require('../mock/fastly-purge.mock');
		mockery.registerMock('fastly-purge', FastlyPurge);

		addHours = sinon.stub();
		mockery.registerMock('date-fns/add_hours', addHours);

		startOfHour = sinon.stub();
		mockery.registerMock('date-fns/start_of_hour', startOfHour);

		getHours = sinon.stub();
		mockery.registerMock('date-fns/get_hours', getHours);

		differenceInMilliseconds = sinon.stub();
		mockery.registerMock('date-fns/difference_in_milliseconds', differenceInMilliseconds);

		purgeFromFastly = require('../../../lib/purge-from-fastly');
	});

	it('exports a function', () => {
		assert.isFunction(purgeFromFastly);
	});

	describe('purgeFromFastly()', () => {
		it('throws an error', () => {
			assert.throws(() => purgeFromFastly());
		});
	});

	describe('purgeFromFastly(fastlyApiKey)', () => {
		it('throws an error', () => {
			assert.throws(() => purgeFromFastly('api-key'));
		});
	});

	describe('purgeFromFastly(fastlyApiKey, fastlyServiceId)', () => {
		let instance;
		let fastlyApiKey;
		let clock;
		let fastlyServiceId;

		beforeEach(() => {
			fastlyApiKey = 'api-key';
			fastlyServiceId = 'service-id';
			clock = sinon.useFakeTimers();
			sinon.stub(global, 'setTimeout');
			instance = purgeFromFastly(fastlyApiKey, fastlyServiceId);
		});

		afterEach(() => {
			global.setTimeout.restore();
			clock.restore();
		});

		it('constructs a fastly-purge object with the api-key', () => {
			assert.calledWithExactly(FastlyPurge, fastlyApiKey, {
				softPurge: true
			});
		});

		it('exports a function', () => {
			assert.isFunction(instance);
		});

		describe('purgeFromFastly(fastlyApiKey)(url)', () => {
			let timeoutStartTime;
			let twoHoursLater;

			beforeEach(() => {
				timeoutStartTime = new Date().setHours(2);
				twoHoursLater = new Date(timeoutStartTime);
				addHours.returns(twoHoursLater);
				startOfHour.returns(twoHoursLater);
				getHours.returns(2);
				differenceInMilliseconds.returns(7200000);
				setTimeout.returns(1);
			});

			it('creates a setTimeout function to fire if one does not exist', () => {
				instance(url);
				assert.calledWithExactly(addHours, new Date(), 2);
				assert.calledWithExactly(startOfHour, twoHoursLater);
				assert.calledOnce(setTimeout);
			});

			it('creates a setTimeout function which runs atleast in an hours time', () => {
				instance(url);
				assert.greaterThanOrEqual(setTimeout.firstCall.args[1], timeoutStartTime);
			});

			it('does not create a setTimeout function if one does already exist', () => {
				instance(url);
				instance(url);
				assert.calledOnce(setTimeout);
			});

			it('purges a url from Fastly when timeout is fired', () => {
				FastlyPurge.mockInstance.url.yields();
				setTimeout.yields();
				instance(url);
				assert.calledOnce(FastlyPurge.mockInstance.url);
				assert.equal(FastlyPurge.mockInstance.url.firstCall.args[0], url);
				assert.deepEqual(FastlyPurge.mockInstance.url.firstCall.args[1], { apiKey: 'api-key' });
			});

			it('purges a url from Fastly only once', () => {
				FastlyPurge.mockInstance.url.yields();
				instance(url);
				instance(url);
				setTimeout.getCall(0).callArg(0);
				assert.calledOnce(FastlyPurge.mockInstance.url);
				assert.equal(FastlyPurge.mockInstance.url.firstCall.args[0], url);

			});

			it('purges a key from Fastly when timeout is fired', () => {
				FastlyPurge.mockInstance.key.yields();
				setTimeout.yields();
				instance(key, {
					isKey: true
				});
				assert.notCalled(FastlyPurge.mockInstance.url);
				assert.calledOnce(FastlyPurge.mockInstance.key);
				assert.calledWith(FastlyPurge.mockInstance.key, fastlyServiceId, key, {
					apiKey: fastlyApiKey
				});
			});

			it('purges a key from Fastly only once', () => {
				FastlyPurge.mockInstance.key.yields();
				instance(key, {
					isKey: true
				});
				instance(key, {
					isKey: true
				});
				setTimeout.getCall(0).callArg(0);
				assert.calledOnce(FastlyPurge.mockInstance.key);
				assert.calledWith(FastlyPurge.mockInstance.key, fastlyServiceId, key, {
					apiKey: fastlyApiKey
				});

			});

			it('reschedule a purge if the current one has failed', () => {
				FastlyPurge.mockInstance.url.yields(new Error('Something broke!'));
				instance(url);
				setTimeout.getCall(0).callArg(0);
				assert.calledOnce(FastlyPurge.mockInstance.url);
				FastlyPurge.mockInstance.url.yields();
				setTimeout.onSecondCall().yields();
				assert.calledOnce(FastlyPurge.mockInstance.url);
			});
		});
	});
});