'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/health-checks', () => {
	let HealthChecks;
	let requestPromise;

	beforeEach(() => {
		requestPromise = require('../mock/request-promise.mock');
		mockery.registerMock('./request-promise', requestPromise);

		HealthChecks = require('../../../lib/health-checks');
	});

	it('exports a function', () => {
		assert.isFunction(HealthChecks);
	});

	describe('new HealthChecks(options)', () => {
		let instance;
		let options;
		let retrieveData;
		let bindRetrieveData;

		beforeEach(() => {
			options = {
				cloudinaryAccountName: 'financial-times',
				customSchemeStore: 'http://customschemestore/'
			};
			sinon.stub(global, 'setInterval');
			retrieveData = sinon.stub(HealthChecks.prototype, 'retrieveData');
			bindRetrieveData = sinon.spy(retrieveData, 'bind');
			instance = new HealthChecks(options);
			HealthChecks.prototype.retrieveData.restore();
		});

		afterEach(() => {
			global.setInterval.restore();
		});

		it('has a `cloudinaryCheckUrl` property', () => {
			assert.strictEqual(instance.cloudinaryCheckUrl, 'http://res.cloudinary.com/financial-times/image/fetch/https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img');
		});

		it('has a `customSchemeCheckUrl` property', () => {
			assert.strictEqual(instance.customSchemeCheckUrl, 'http://customschemestore/fticon/v1/cross.svg');
		});

		it('has a `statuses` property', () => {
			assert.isObject(instance.statuses);
		});

		it('has a `statuses.cloudinary` property', () => {
			assert.isObject(instance.statuses.cloudinary);
		});

		it('has a `statuses.customSchemeStore` property', () => {
			assert.isObject(instance.statuses.customSchemeStore);
		});

		it('calls `retrieveData`', () => {
			assert.calledOnce(retrieveData);
			assert.calledWithExactly(retrieveData);
		});

		it('sets an interval to retrieve data again', () => {
			assert.calledOnce(global.setInterval);
			assert.calledOnce(bindRetrieveData);
			assert.calledWithExactly(bindRetrieveData, instance);
			assert.calledWithExactly(global.setInterval, bindRetrieveData.firstCall.returnValue, 60 * 1000);
		});

		it('has a `retrieveData` method', () => {
			assert.isFunction(instance.retrieveData);
		});

		describe('.retrieveData()', () => {

			beforeEach(() => {
				sinon.stub(instance, 'pingService');
				instance.retrieveData();
			});

			it('calls `pingService` with the Cloudinary transform URL', () => {
				assert.called(instance.pingService);
				assert.calledWithExactly(instance.pingService, 'cloudinary', instance.cloudinaryCheckUrl);
			});

			it('calls `pingService` with the navigation data store URL', () => {
				assert.called(instance.pingService);
				assert.calledWithExactly(instance.pingService, 'customSchemeStore', instance.customSchemeCheckUrl);
			});

		});

		it('has a `pingService` method', () => {
			assert.isFunction(instance.pingService);
		});

		describe('.pingService(name, url)', () => {

			beforeEach(() => {
				requestPromise.resolves({
					statusCode: 200
				});
				instance.statuses = {
					foo: {}
				};
				return instance.pingService('foo', 'bar');
			});

			it('requests the given URL', () => {
				assert.calledOnce(requestPromise);
				assert.calledWith(requestPromise, {
					uri: 'bar',
					method: 'HEAD'
				});
			});

			it('sets the status of the check to `true`', () => {
				assert.isTrue(instance.statuses.foo.ok);
			});

			describe('when the response from the URL is not OK', () => {

				beforeEach(() => {
					requestPromise.resolves({
						statusCode: 400
					});
					return instance.pingService('foo', 'bar');
				});

				it('sets the status of the check to `false`', () => {
					assert.isFalse(instance.statuses.foo.ok);
				});

			});

			describe('when the fetch errors', () => {

				beforeEach(() => {
					requestPromise.rejects(new Error('request-error'));
					return instance.pingService('foo', 'bar');
				});

				it('sets the status of the check to `false`', () => {
					assert.isFalse(instance.statuses.foo.ok);
				});

			});

			describe('when the `testHealthcheckFailure` option is `true`', () => {

				beforeEach(() => {
					options.testHealthcheckFailure = 'YESPLEASE';
					instance = new HealthChecks(options);
					instance.statuses = {
						foo: {}
					};
					return instance.pingService('foo', 'bar');
				});

				it('sets the status of the check to `false`', () => {
					assert.isFalse(instance.statuses.foo.ok);
				});

			});

		});

		it('has a `getFunction` method', () => {
			assert.isFunction(instance.getFunction);
		});

		describe('.getFunction()', () => {
			let returnValue;

			beforeEach(() => {
				sinon.stub(instance, 'getPromise').returns(Promise.resolve());
				returnValue = instance.getFunction();
			});

			it('returns a function', () => {
				assert.isFunction(returnValue);
			});

			describe('returned function', () => {

				beforeEach(() => {
					let returnedFunction = returnValue;
					returnValue = returnedFunction();
				});

				it('calls `getPromise`', () => {
					assert.calledOnce(instance.getPromise);
					assert.calledWithExactly(instance.getPromise);
				});

				it('returns the return value of `getPromise`', () => {
					assert.strictEqual(returnValue, instance.getPromise.firstCall.returnValue);
				});

			});

		});

		it('has a `getGoodToGoFunction` method', () => {
			assert.isFunction(instance.getGoodToGoFunction);
		});

		describe('.getGoodToGoFunction()', () => {
			let returnValue;

			beforeEach(() => {
				sinon.stub(instance, 'getGoodToGoPromise').returns(Promise.resolve());
				returnValue = instance.getGoodToGoFunction();
			});

			it('returns a function', () => {
				assert.isFunction(returnValue);
			});

			describe('returned function', () => {

				beforeEach(() => {
					let returnedFunction = returnValue;
					returnValue = returnedFunction();
				});

				it('calls `getGoodToGoPromise`', () => {
					assert.calledOnce(instance.getGoodToGoPromise);
					assert.calledWithExactly(instance.getGoodToGoPromise);
				});

				it('returns the return value of `getGoodToGoPromise`', () => {
					assert.strictEqual(returnValue, instance.getGoodToGoPromise.firstCall.returnValue);
				});

			});

		});

		it('has a `getPromise` method', () => {
			assert.isFunction(instance.getPromise);
		});

		describe('.getPromise()', () => {
			let returnValue;
			let status1;
			let status2;
			let statuses;

			beforeEach(() => {
				status1 = {id: 'status-1'};
				status2 = {id: 'status-2'};
				statuses = [status1, status2];
				sinon.stub(instance, 'getStatusArray').returns(statuses);
				returnValue = instance.getPromise();
			});

			it('calls `getStatusArray`', () => {
				assert.calledOnce(instance.getStatusArray);
				assert.calledWithExactly(instance.getStatusArray);
			});

			it('returns a promise', () => {
				assert.instanceOf(returnValue, Promise);
			});

			describe('returned promise', () => {
				let resolvedValue;

				beforeEach(() => {
					return returnValue.then(value => {
						resolvedValue = value;
					});
				});

				it('resolves with the return value of `getStatusArray`', () => {
					assert.strictEqual(resolvedValue, statuses);
				});

			});

		});

		it('has a `getGoodToGoPromise` method', () => {
			assert.isFunction(instance.getGoodToGoPromise);
		});

		describe('.getGoodToGoPromise()', () => {
			let returnValue;
			let status1;
			let status2;
			let statuses;

			beforeEach(() => {
				status1 = {id: 'status-1', ok: true};
				status2 = {id: 'status-2', ok: true};
				statuses = [status1, status2];
				sinon.stub(instance, 'getStatusArray').returns(statuses);
				returnValue = instance.getGoodToGoPromise();
			});

			it('calls `getStatusArray`', () => {
				assert.calledOnce(instance.getStatusArray);
				assert.calledWithExactly(instance.getStatusArray);
			});

			it('returns a promise', () => {
				assert.instanceOf(returnValue, Promise);
			});

			describe('returned promise', () => {
				let resolvedValue;

				beforeEach(() => {
					return returnValue.then(value => {
						resolvedValue = value;
					});
				});

				it('resolves with `true`', () => {
					assert.isTrue(resolvedValue);
				});

			});

			describe('when the return value of `getStatusArray` contains a status that\'s not OK', () => {

				beforeEach(() => {
					status1.ok = false;
					returnValue = instance.getGoodToGoPromise();
				});

				describe('returned promise', () => {
					let resolvedValue;

					beforeEach(() => {
						return returnValue.then(value => {
							resolvedValue = value;
						});
					});

					it('resolves with `false`', () => {
						assert.isFalse(resolvedValue);
					});

				});

			});

		});

		it('has a `getStatusArray` method', () => {
			assert.isFunction(instance.getStatusArray);
		});

		describe('.getStatusArray()', () => {
			let returnValue;

			beforeEach(() => {
				instance.statuses = {
					foo: {id: 'foo'},
					bar: {id: 'bar'}
				};
				returnValue = instance.getStatusArray();
			});

			it('returns an array of the values in the `statuses` property', () => {
				assert.deepEqual(returnValue, [
					{id: 'foo'},
					{id: 'bar'}
				]);
			});

		});


	});

});
