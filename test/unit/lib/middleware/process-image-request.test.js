'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/process-image-request', () => {
	let cloudinaryTransform;
	let cloudinary;
	let ImageTransform;
	let origamiService;
	let processImageRequest;

	beforeEach(() => {
		ImageTransform = sinon.stub();
		mockery.registerMock('../image-transform', ImageTransform);

		cloudinaryTransform = sinon.stub();
		mockery.registerMock('../transformers/cloudinary', cloudinaryTransform);
		
		cloudinary = sinon.stub();
		cloudinary.v2 = {
			uploader:{
				upload: sinon.stub().yields(),
			},
			api:{
				resource: sinon.stub().yields(),
			},
			config: sinon.stub(),
		};
		mockery.registerMock('cloudinary', cloudinary);

		origamiService = require('../../mock/origami-service.mock');

		processImageRequest = require('../../../../lib/middleware/process-image-request');
	});

	it('exports a function', () => {
		assert.isFunction(processImageRequest);
	});

	describe('processImageRequest(config)', () => {
		let config;
		let middleware;

		beforeEach(() => {
			config = {
				cloudinaryAccountName: 'baz',
				cloudinaryApiKey: 'api-key',
				cloudinaryApiSecret: 'api-secret'
			};
			middleware = processImageRequest(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', function() {
			this.timeout(30 * 1000);
			let mockImageTransform;
			let name;
			let next;
			beforeEach((done) => {
				next = sinon.spy();
				mockImageTransform = {
					getUri: () => 'https://origami-images.ft.com/fthead/v1/lionel-barber-595330c73ff13873ae15ce65db55d88a2b7fcc0d14af17a4950f9f3477a56e988a18cca1dfab9f055c1c827221bcab11376ea6fe553068c2af6093f85028d517',
					setName: (n) => {name=n;},
					getName: () => name
				};
				ImageTransform.returns(mockImageTransform);

				cloudinaryTransform.returns('mock-cloudinary-url');

				origamiService.mockRequest.params.imageUrl = 'mock-uri';
				origamiService.mockRequest.query.source = 'mock-source';
				middleware(origamiService.mockRequest, origamiService.mockResponse, function(error){
					next(error);
					done(error);
				});
			});

			it('sets the request query `uri` property to the `imageUrl` request param', () => {
				assert.strictEqual(origamiService.mockRequest.query.uri, origamiService.mockRequest.params.imageUrl);
			});

			it('creates an image transform using the query parameters', () => {
				assert.calledOnce(ImageTransform);
				assert.calledWithNew(ImageTransform);
				assert.calledWithExactly(ImageTransform, origamiService.mockRequest.query);
			});

			it('generates a Cloudinary transform URL with the image transform', () => {
				assert.calledOnce(cloudinaryTransform);
				assert.strictEqual(cloudinaryTransform.firstCall.args[0], mockImageTransform);
				assert.deepEqual(cloudinaryTransform.firstCall.args[1], {
					cloudinaryAccountName: config.cloudinaryAccountName,
					cloudinaryApiKey: config.cloudinaryApiKey,
					cloudinaryApiSecret: config.cloudinaryApiSecret
				});
			});

			it('sets the request `transform` property to the created image transform', () => {
				assert.strictEqual(origamiService.mockRequest.transform, mockImageTransform);
			});

			it('sets the request `appliedTransform` property to the Cloudinary URL', () => {
				assert.strictEqual(origamiService.mockRequest.appliedTransform, 'mock-cloudinary-url');
			});

			describe('when the image transform format is "svg" and tint is set', () => {

				beforeEach(() => {
					mockImageTransform.format = 'svg';
					mockImageTransform.tint = ['ff0000'];
					mockImageTransform.uri = 'transform-uri';
					mockImageTransform.setUri = sinon.spy();
					mockImageTransform.setTint = sinon.spy();
					origamiService.mockRequest.hostname = 'hostname';
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the image transform `uri` property to route through the SVG tinter', () => {
					assert.calledOnce(mockImageTransform.setUri);
					assert.strictEqual(mockImageTransform.setUri.firstCall.args[0], 'https://hostname/v2/images/svgtint/transform-uri?color=ff0000');
				});

				it('removes the tint property from the image transform', () => {
					assert.calledOnce(mockImageTransform.setTint);
					assert.calledWithExactly(mockImageTransform.setTint);
				});

				describe('when the transform URI has a querystring', () => {

					beforeEach(() => {
						mockImageTransform.setUri.resetHistory();
						mockImageTransform.uri = 'transform-uri?foo';
						middleware(origamiService.mockRequest, origamiService.mockResponse, next);
					});

					it('sets the image transform `uri` property to route through the SVG tinter', () => {
						assert.calledOnce(mockImageTransform.setUri);
						assert.strictEqual(mockImageTransform.setUri.firstCall.args[0], 'https://hostname/v2/images/svgtint/transform-uri%3Ffoo&color=ff0000');
					});

				});

				describe('when `config.hostname` is set', () => {

					beforeEach(() => {
						mockImageTransform.setUri.resetHistory();
						config.hostname = 'config-hostname';
						middleware(origamiService.mockRequest, origamiService.mockResponse, next);
					});

					it('sets the image transform `uri` property to route through the SVG tinter', () => {
						assert.calledOnce(mockImageTransform.setUri);
						assert.strictEqual(mockImageTransform.setUri.firstCall.args[0], 'https://config-hostname/v2/images/svgtint/transform-uri?color=ff0000');
					});

				});

			});

			describe('when the image request is "immutable" ', () => {

				beforeEach(() => {
					mockImageTransform.setImmutable = sinon.spy();
					origamiService.mockRequest.params.immutable = true;
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the image transform `immutable` property to true', () => {
					assert.calledOnce(mockImageTransform.setImmutable);
					assert.strictEqual(mockImageTransform.setImmutable.firstCall.args[0], true);
				});
			});

			describe('when the image request is not "immutable" ', () => {

				beforeEach(() => {
					mockImageTransform.setImmutable = sinon.spy();
					origamiService.mockRequest.params.immutable = false;
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the image transform `immutable` property to false', () => {
					assert.notCalled(mockImageTransform.setImmutable);
				});
			});

			describe('when ImageTransform throws an error', () => {
				let imageTransformError;

				beforeEach(() => {
					next.resetHistory();
					imageTransformError = new Error('image transform error');
					ImageTransform.throws(imageTransformError);
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 400', () => {
					assert.strictEqual(imageTransformError.status, 400);
				});

				it('sets the error `cacheMaxAge` property to "10m"', () => {
					assert.strictEqual(imageTransformError.status, 400);
				});

				it('calls `next` with the error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, imageTransformError);
				});

			});

		});

	});

});
