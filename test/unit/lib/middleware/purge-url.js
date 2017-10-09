'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
require('sinon-as-promised');

describe('lib/middleware/purge-url', () => {
	let origamiService;
	let purgeUrl;
	let FastlyPurge;
	let cloudinary;
	let ImageTransform;
	let base64;
	let utf8;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		FastlyPurge = require('../../mock/purge-from-fastly.mock');
		mockery.registerMock('../purge-from-fastly', FastlyPurge);

		cloudinary = require('../../mock/cloudinary.mock');
		mockery.registerMock('cloudinary', cloudinary);

		ImageTransform = require('../../mock/image-transform.mock');
		mockery.registerMock('../image-transform', ImageTransform);

		base64 = require('../../mock/base-64.mock');
		mockery.registerMock('base-64', base64);

		utf8 = require('../../mock/utf8.mock');
		mockery.registerMock('utf8', utf8);

		purgeUrl = require('../../../../lib/middleware/purge-url');
	});

	it('exports a function', () => {
		assert.isFunction(purgeUrl);
	});

	describe('purgeUrl(config)', () => {
		let middleware;
		let config;
		beforeEach(() => {
			config = {
				fastlyApiKey: 'api-key',
				fastlyServiceId: 'service-id',
				cloudinaryAccountName: 'cloudinaryAccountName',
				cloudinaryApiKey: 'cloudinaryApiKey',
				cloudinaryApiSecret: 'cloudinaryApiSecret',
				customSchemeStore: 'customSchemeStore',
				customSchemeCacheBust: 'customSchemeCacheBust'
			};

			middleware = purgeUrl(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		it('constructs a cloudinary object with passed in configuration', () => {
			assert.calledWithExactly(cloudinary.config, {
				cloud_name: 'cloudinaryAccountName',
				api_key: 'cloudinaryApiKey',
				api_secret: 'cloudinaryApiSecret'
			});
		});

		it('constructs a purgeFromFastly object with passed in configuration', () => {
			assert.calledWithExactly(FastlyPurge, 'api-key', 'service-id');
		});

		describe('middleware(request, response, next)', () => {
			const url = 'http://im.ft-static.com/content/images/mock-id.img';

			describe('when the request does not specify a url to purge', () => {
				it('calls `next` with a 400 error', () => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext);

					assert.called(origamiService.mockNext);

					const error = origamiService.mockNext.firstCall.args[0];
					assert.instanceOf(error, Error);
					assert.strictEqual(error.status, 400);
					assert.strictEqual(error.message, 'Please url-encode the url you want to purge and add it as the value to the query parameter `url`. E.G. `/purge/url?url=`');
				});
			});

			describe('when the request specifies a url to purge', () => {
				let dateToPurge;

				beforeEach(() => {
					dateToPurge = new Date();
					FastlyPurge.mockInstance.returns(dateToPurge);
					origamiService.mockRequest.query.url = encodeURIComponent(url);
					cloudinary.uploader.destroy.resolves({
						result: 'ok'
					});
				});

				describe('when the url is purgeable from Cloudinary', () => {

					it('purges from cloudinary', () => {
						return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext)
							.then(() => {
								assert.called(cloudinary.uploader.destroy);
							});
					});

					it('schedules to purges from Fastly', () => {
						return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext)
							.then(() => {
								assert.called(FastlyPurge.mockInstance);
								assert.calledWithExactly(FastlyPurge.mockInstance, url);
							});
					});

					it('returns a 200 with a messaging indicating when it will purge from Fastly', () => {
						return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext)
							.then(() => {
								assert.notCalled(origamiService.mockNext);
								assert.calledWithExactly(origamiService.mockResponse.status, 200);
								assert.calledWithExactly(origamiService.mockResponse.send, `Purged ${url} from Cloudinary, will purge from Fastly at ${dateToPurge}`);
							});
					});

					describe('when the request specifies to remove all transforms of the original image', () => {
						let key;

						beforeEach(() => {
							key = 'key';
							origamiService.mockRequest.query.transforms = 'true';
							ImageTransform.resolveCustomSchemeUri.returns(key);
							base64.encode.returnsArg(0);
							utf8.encode.returnsArg(0);
						});

						it('purges from cloudinary', () => {
							return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext)
								.then(() => {
									assert.called(cloudinary.uploader.destroy);
								});
						});

						it('finds the key for the scheme url and uses it to schedule a purge from Fasly', () => {
							return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext)
								.then(() => {
									assert.calledWithExactly(ImageTransform.resolveCustomSchemeUri, url, config.customSchemeStore, config.customSchemeCacheBust);
									assert.calledWithExactly(FastlyPurge.mockInstance, key, {
										isKey: true
									});
								});
						});

						it('returns a 200 with a messaging indicating when it will purge from Fastly', () => {
							return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext)
								.then(() => {
									assert.notCalled(origamiService.mockNext);
									assert.calledWithExactly(origamiService.mockResponse.status, 200);
									assert.calledWithExactly(origamiService.mockResponse.send, `Purged ${url} from Cloudinary, will purge key ${key} from Fastly at ${dateToPurge}`);
								});
						});
					});
				});

				describe('when the url is not purgeable from Cloudinary', () => {
					it('returns a 200 with a messaging indicating when it will purge from Fastly', () => {
						cloudinary.uploader.destroy.resolves({result: 'not found'});
						origamiService.mockRequest.query.url = encodeURIComponent(url);

						return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext).then(() => {
							assert.called(cloudinary.uploader.destroy);
							assert.notCalled(origamiService.mockNext);
							assert.calledWithExactly(origamiService.mockResponse.status, 200);
							assert.calledWithExactly(origamiService.mockResponse.send, `Purged ${url} from Cloudinary, will purge from Fastly at ${dateToPurge}`);
						});
					});
				});

				describe('when the Cloudinary purging fails outright', () => {
					it('calls `next` with a 500 error', () => {
						cloudinary.uploader.destroy.rejects(Error('Something broke!'));
						origamiService.mockRequest.query.url = encodeURIComponent(url);

						return middleware(origamiService.mockRequest, origamiService.mockResponse, origamiService.mockNext).then(() => {
							assert.called(cloudinary.uploader.destroy);
							assert.called(origamiService.mockNext);

							const error = origamiService.mockNext.firstCall.args[0];
							assert.instanceOf(error, Error);
							assert.strictEqual(error.status, 500);
							assert.strictEqual(error.message, 'Something broke!');
						});
					});
				});
			});
		});
	});
});