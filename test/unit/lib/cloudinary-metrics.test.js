'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/cloudinary-metrics', () => {
	let cloudinary;
	let CloudinaryMetrics;
	let origamiService;

	beforeEach(() => {
		cloudinary = require('../mock/cloudinary.mock');
		mockery.registerMock('cloudinary', cloudinary);

		origamiService = require('../mock/origami-service.mock');

		CloudinaryMetrics = require('../../../lib/cloudinary-metrics');
	});

	it('exports a function', () => {
		assert.isFunction(CloudinaryMetrics);
	});

	describe('new CloudinaryMetrics(app)', () => {
		let instance;
		let options;
		let pingUsage;
		let bindPingUsage;

		beforeEach(() => {
			sinon.stub(global, 'setInterval');
			pingUsage = sinon.stub(CloudinaryMetrics.prototype, 'pingUsage');
			bindPingUsage = sinon.spy(pingUsage, 'bind');
			options = origamiService.mockApp.ft.options = {
				cloudinaryAccountName: 'mock-account-name',
				cloudinaryApiKey: 'mock-api-key',
				cloudinaryApiSecret: 'mock-api-secret'
			};
			instance = new CloudinaryMetrics(origamiService.mockApp);
			CloudinaryMetrics.prototype.pingUsage.restore();
		});

		afterEach(() => {
			global.setInterval.restore();
		});

		it('configures Cloudinary', () => {
			assert.calledOnce(cloudinary.config);
			assert.calledWith(cloudinary.config, {
				cloud_name: options.cloudinaryAccountName,
				api_key: options.cloudinaryApiKey,
				api_secret: options.cloudinaryApiSecret
			});
		});

		it('calls `pingUsage`', () => {
			assert.calledOnce(pingUsage);
			assert.calledWithExactly(pingUsage);
		});

		it('sets an interval to retrieve data again', () => {
			assert.calledOnce(global.setInterval);
			assert.calledOnce(bindPingUsage);
			assert.calledWithExactly(bindPingUsage, instance);
			assert.calledWithExactly(global.setInterval, bindPingUsage.firstCall.returnValue, 5 * 60 * 1000);
		});

		it('has a `pingUsage` method', () => {
			assert.isFunction(instance.pingUsage);
		});

		describe('.pingUsage()', () => {
			let usageData;

			beforeEach(() => {
				usageData = {
					transformations: {
						usage: 1,
						limit: 2
					},
					objects: {
						usage: 3,
						limit: 4
					},
					bandwidth: {
						usage: 5,
						limit: 6
					},
					storage: {
						usage: 7,
						limit: 8
					}
				};
				cloudinary.api.usage.resolves(usageData);
				return instance.pingUsage();
			});

			it('calls `cloudinary.api.usage`', () => {
				assert.calledOnce(cloudinary.api.usage);
				assert.calledWithExactly(cloudinary.api.usage);
			});

			it('increments metrics for transformations, objects, bandwidth, and storage', () => {
				const metrics = origamiService.mockApp.ft.metrics;
				assert.called(metrics.count);
				assert.calledWithExactly(metrics.count, 'cloudinary.transformations.usage', 1);
				assert.calledWithExactly(metrics.count, 'cloudinary.transformations.limit', 2);
				assert.calledWithExactly(metrics.count, 'cloudinary.objects.usage', 3);
				assert.calledWithExactly(metrics.count, 'cloudinary.objects.limit', 4);
				assert.calledWithExactly(metrics.count, 'cloudinary.bandwidth.usage', 5);
				assert.calledWithExactly(metrics.count, 'cloudinary.bandwidth.limit', 6);
				assert.calledWithExactly(metrics.count, 'cloudinary.storage.usage', 7);
				assert.calledWithExactly(metrics.count, 'cloudinary.storage.limit', 8);
			});

			describe('when `cloudinary.api.usage` rejects', () => {
				let cloudinaryError;

				beforeEach(() => {
					cloudinaryError = new Error('mock cloudinary error');
					origamiService.mockApp.ft.metrics.count.reset();
					cloudinary.api.usage.rejects(cloudinaryError);
					return instance.pingUsage().catch();
				});

				it('logs an error', () => {
					assert.calledOnce(origamiService.mockApp.ft.log.error);
					assert.calledWithExactly(origamiService.mockApp.ft.log.error, 'Cloudinary Metrics Failure (usage): mock cloudinary error');
				});

				it('does not increment metrics', () => {
					assert.notCalled(origamiService.mockApp.ft.metrics.count);
				});

			});

			describe('when `cloudinary.api.usage` throws', () => {
				let cloudinaryError;

				beforeEach(() => {
					cloudinaryError = new Error('mock cloudinary error');
					origamiService.mockApp.ft.metrics.count.reset();
					cloudinary.api.usage.throws(cloudinaryError);
					instance.pingUsage();
				});

				it('logs an error', () => {
					assert.calledOnce(origamiService.mockApp.ft.log.error);
					assert.calledWithExactly(origamiService.mockApp.ft.log.error, 'Cloudinary Metrics Failure (usage): mock cloudinary error');
				});

				it('does not increment metrics', () => {
					assert.notCalled(origamiService.mockApp.ft.metrics.count);
				});

			});

		});

	});

});
