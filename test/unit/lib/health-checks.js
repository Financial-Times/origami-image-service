'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/health-checks', () => {
	let cloudinary;
	let healthChecks;
	let HealthCheck;
	let log;
	let mockHealthCheck;

	beforeEach(() => {
		cloudinary = require('../mock/cloudinary.mock');
		mockery.registerMock('cloudinary', cloudinary);

		mockHealthCheck = {
			isMockHealthCheck: true
		};
		HealthCheck = sinon.stub().returns(mockHealthCheck);
		mockery.registerMock('@financial-times/health-check', HealthCheck);

		log = require('../mock/log.mock');

		healthChecks = require('../../../lib/health-checks');
	});

	it('exports a function', () => {
		assert.isFunction(healthChecks);
	});

	describe('healthChecks(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				cloudinaryAccountName: 'financial-times',
				customSchemeStore: 'http://customschemestore/',
				log: log
			};
			instance = healthChecks(options);
		});

		it('creates a new HealthCheck instance', () => {
			assert.calledOnce(HealthCheck);
			assert.calledWithNew(HealthCheck);
			assert.isObject(HealthCheck.firstCall.args[0]);
			assert.strictEqual(HealthCheck.firstCall.args[0].log, log);
			assert.isArray(HealthCheck.firstCall.args[0].checks);
		});

		it('returns the instance', () => {
			assert.strictEqual(instance, mockHealthCheck);
		});

	});

});
