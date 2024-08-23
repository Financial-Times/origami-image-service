const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');
const httpMock = require('node-mocks-http');
const nock = require('nock');

describe('lib/middleware/process-image-request', () => {
	let cloudinaryTransform;
	let cloudinary;
	let ImageTransform;
	let processImageRequest;
	let origamiService;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		ImageTransform = sinon.stub();
		mockery.registerMock('../image-transform', ImageTransform);

		cloudinaryTransform = sinon.stub();
		mockery.registerMock('../transformers/cloudinary', cloudinaryTransform);

		cloudinary = sinon.stub();
		cloudinary.v2 = {
			uploader: {
				upload: sinon.stub().yields(),
				text: sinon.stub().yields(),
			},
			api: {
				resource: sinon.stub().yields(),
			},
			config: sinon.stub(),
		};
		mockery.registerMock('cloudinary', cloudinary);

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
				cloudinaryApiSecret: 'api-secret',
			};
			middleware = processImageRequest(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('placeholder middleware(request, response, next)', function () {
			this.timeout(30 * 1000);
			let mockImageTransform;
			let next;
			let name;
			let fit;
			let format = 'png';
			let request;
			let response;

			beforeEach(done => {
				request = httpMock.createRequest();
				request.app = origamiService.mockApp;
				response = httpMock.createResponse();
				next = sinon.stub();
				mockImageTransform = {
					getUri: () =>
						`${
							process.env.CUSTOM_SCHEME_STORE ||
							process.env.HOST ||
							'https://origami-image-service-dev.herokuapp.com'
						}/__origami/service/image/v2/images/raw/ftsocial-v1%3Atwitter%3Fsource%3Dorigami-image-service`,
					setName: n => {
						name = n;
					},
					setFit: f => {
						fit = f;
					},
					getFormat: () => format,
					setFormat: f => {
						format = f;
					},
					getName: () => name,
				};

				ImageTransform.returns(mockImageTransform);

				cloudinaryTransform.returns('mock-cloudinary-url');

				request.params.imageMode = 'placeholder';
				request.params.imageUrl = '';
				request.query.source = 'mock-source';
				done();
			});

			it('calls .text once with the correct args', async () => {
				request.query.width = 200;
				request.query.height = 200;
				await middleware(request, response, next);
				assert.calledOnce(cloudinary.v2.uploader.text);
			});

			it('changes svg format to auto', async () => {
				format = 'svg';
				await middleware(request, response, next);
				assert.equal(format, 'auto');
			});

			it('sets fit format to fill', async () => {
				await middleware(request, response, next);
				assert.equal(fit, 'fill');
			});
		});

		describe('middleware(request, response, next)', function () {
			this.timeout(30 * 1000);
			let mockImageTransform;
			let name;
			let request;
			let response;
			let next;

			beforeEach(done => {
				request = httpMock.createRequest();
				request.app = origamiService.mockApp;
				response = httpMock.createResponse();
				next = sinon.stub();
				mockImageTransform = {
					getUri: () =>
						`${
							process.env.CUSTOM_SCHEME_STORE ||
							process.env.HOST ||
							'https://origami-image-service-dev.herokuapp.com'
						}/__origami/service/image/v2/images/raw/ftsocial-v1:twitter?source=origami-image-service`,
					setName: n => {
						name = n;
					},
					getName: () => name,
				};
				ImageTransform.returns(mockImageTransform);

				cloudinaryTransform.returns('mock-cloudinary-url');

				request.params.imageMode = 'raw';
				request.params.imageUrl = 'mock-uri';
				request.query.source = 'mock-source';
				middleware(request, response, function (error) {
					next(error);
					done(error);
				});
			});

			it('sets the request query `uri` property to the `imageUrl` request param', () => {
				assert.strictEqual(request.query.uri, request.params.imageUrl);
			});

			it('does not call .text when the request.params.imageMode', () => {
				request.params.imageMode = 'placeholder';
				assert.notCalled(cloudinary.v2.uploader.text);
			});

			it('creates an image transform using the query parameters', () => {
				assert.calledOnce(ImageTransform);
				assert.calledWithNew(ImageTransform);
				assert.calledWithExactly(ImageTransform, request.query);
			});

			it('generates a Cloudinary transform URL with the image transform', () => {
				assert.calledOnce(cloudinaryTransform);
				assert.strictEqual(
					cloudinaryTransform.firstCall.args[0],
					mockImageTransform
				);
				assert.deepEqual(cloudinaryTransform.firstCall.args[1], {
					cloudinaryAccountName: config.cloudinaryAccountName,
					cloudinaryApiKey: config.cloudinaryApiKey,
					cloudinaryApiSecret: config.cloudinaryApiSecret,
				});
			});

			it('sets the request `transform` property to the created image transform', () => {
				assert.strictEqual(request.transform, mockImageTransform);
			});

			it('sets the request `appliedTransform` property to the Cloudinary URL', () => {
				assert.strictEqual(request.appliedTransform, 'mock-cloudinary-url');
			});

			describe('when the image transform format is "svg" and tint is set', () => {
				beforeEach(() => {
					mockImageTransform.format = 'svg';
					mockImageTransform.tint = ['ff0000'];
					mockImageTransform.uri = 'transform-uri';
					mockImageTransform.setUri = sinon.spy();
					mockImageTransform.setTint = sinon.spy();
					request.hostname = 'hostname';
					middleware(request, response, next);
				});

				it('sets the image transform `uri` property to route through the SVG tinter', () => {
					assert.calledOnce(mockImageTransform.setUri);
					assert.strictEqual(
						mockImageTransform.setUri.firstCall.args[0],
						'https://hostname/__origami/service/image/v2/images/svgtint/transform-uri?color=ff0000'
					);
				});

				it('removes the tint property from the image transform', () => {
					assert.calledOnce(mockImageTransform.setTint);
					assert.calledWithExactly(mockImageTransform.setTint);
				});

				describe('when the transform URI has a querystring', () => {
					beforeEach(() => {
						mockImageTransform.setUri.resetHistory();
						mockImageTransform.uri = 'transform-uri?foo';
						middleware(request, response, next);
					});

					it('sets the image transform `uri` property to route through the SVG tinter', () => {
						assert.calledOnce(mockImageTransform.setUri);
						assert.strictEqual(
							mockImageTransform.setUri.firstCall.args[0],
							'https://hostname/__origami/service/image/v2/images/svgtint/transform-uri%3Ffoo&color=ff0000'
						);
					});
				});

				describe('when `config.hostname` is set', () => {
					beforeEach(() => {
						mockImageTransform.setUri.resetHistory();
						config.hostname = 'config-hostname';
						middleware(request, response, next);
					});

					it('sets the image transform `uri` property to route through the SVG tinter', () => {
						assert.calledOnce(mockImageTransform.setUri);
						assert.strictEqual(
							mockImageTransform.setUri.firstCall.args[0],
							'https://config-hostname/__origami/service/image/v2/images/svgtint/transform-uri?color=ff0000'
						);
					});
				});
			});

			describe('when the image request is "immutable" ', () => {
				beforeEach(() => {
					mockImageTransform.setImmutable = sinon.spy();
					request.params.immutable = true;
					middleware(request, response, next);
				});

				it('sets the image transform `immutable` property to true', () => {
					assert.calledOnce(mockImageTransform.setImmutable);
					assert.strictEqual(
						mockImageTransform.setImmutable.firstCall.args[0],
						true
					);
				});
			});

			describe('when the image request is not "immutable" ', () => {
				beforeEach(() => {
					mockImageTransform.setImmutable = sinon.spy();
					request.params.immutable = false;
					middleware(request, response, next);
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
					middleware(request, response, next);
				});

				it('sets the error `status` property to 400', () => {
					assert.strictEqual(imageTransformError.status, 400);
				});

				it('sets the error `cacheMaxAge` property to "1y"', () => {
					assert.strictEqual(imageTransformError.cacheMaxAge, '1y');
				});

				it('calls `next` with the error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, imageTransformError);
				});
			});

			describe('when the request to the original image returns html', () => {
				let scope;
				beforeEach(done => {
					scope = nock('https://ft.com').persist();
					scope
						.get('/twitter.html')
						.reply(
							200,
							'<html><head><title>hello</title></head><body>hello</body></html>',
							{
								'Content-Type': 'text/html;charset=utf-8',
							}
						);
					next.resetHistory();
					mockImageTransform.getUri = () => 'https://ft.com/twitter.html';
					middleware(request, response, error => {
						next(error);
						done();
					});
				});

				it('calls `next` with an error', () => {
					assert.isTrue(next.calledOnce);
					assert.isInstanceOf(next.firstCall.firstArg, Error);
				});

				it('sets the error `skipSentry` property to true', () => {
					assert.isTrue(next.firstCall.firstArg.skipSentry);
				});

				it('sets the error `cacheMaxAge` property to "5m"', () => {
					assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
				});
			});

			describe('when the request to the original image returns a video', () => {
				let scope;
				beforeEach(done => {
					scope = nock('https://ft.com').persist();
					// Smallest mp4 video file from https://github.com/mathiasbynens/small/blob/master/Mpeg4.mp4
					scope
						.get('/twitter.mp4')
						.reply(
							200,
							Buffer.from([
								0, 0, 0, 32, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 2, 0,
								105, 115, 111, 109, 105, 115, 111, 50, 97, 118, 99, 49, 109,
								112, 52, 49, 0, 0, 0, 8, 102, 114, 101, 101, 0, 0, 0, 8, 109,
								100, 97, 116, 0, 0, 0, 214, 109, 111, 111, 118, 0, 0, 0, 108,
								109, 118, 104, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
								232, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
								0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
								0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0,
								0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
								2, 0, 0, 0, 98, 117, 100, 116, 97, 0, 0, 0, 90, 109, 101, 116,
								97, 0, 0, 0, 0, 0, 0, 0, 33, 104, 100, 108, 114, 0, 0, 0, 0, 0,
								0, 0, 0, 109, 100, 105, 114, 97, 112, 112, 108, 0, 0, 0, 0, 0,
								0, 0, 0, 0, 0, 0, 0, 45, 105, 108, 115, 116, 0, 0, 0, 37, 169,
								116, 111, 111, 0, 0, 0, 29, 100, 97, 116, 97, 0, 0, 0, 1, 0, 0,
								0, 0, 76, 97, 118, 102, 53, 55, 46, 52, 49, 46, 49, 48, 48,
							]),
							{
								'Content-Type': 'video/mp4',
							}
						);
					next.resetHistory();
					mockImageTransform.getUri = () => 'https://ft.com/twitter.mp4';
					middleware(request, response, error => {
						next(error);
						done();
					});
				});

				it('calls `next` with an error', () => {
					assert.isTrue(next.calledOnce);
					assert.isInstanceOf(next.firstCall.firstArg, Error);
				});

				it('sets the error `skipSentry` property to true', () => {
					assert.isTrue(next.firstCall.firstArg.skipSentry);
				});

				it('sets the error `cacheMaxAge` property to "5m"', () => {
					assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
				});
			});

			describe('when the request to the original image returns no content-type', () => {
				let scope;
				beforeEach(done => {
					scope = nock('https://ft.com').persist();
					scope
						.get('/twitter')
						.reply(
							200,
							'<html><head><title>hello</title></head><body>hello</body></html>',
							{}
						);
					next.resetHistory();
					mockImageTransform.getUri = () => 'https://ft.com/twitter';
					middleware(request, response, error => {
						next(error);
						done();
					});
				});

				it('does not error', () => {
					assert.isTrue(next.calledOnce);
					assert.isUndefined(next.firstCall.firstArg);
				});
			});

			describe('when the request to the original image fails', () => {
				let scope;
				beforeEach(() => {
					scope = nock('https://ft.com').persist();

					scope.get('/twitter.svg').reply(200, 'svg-code-here', {
						'Content-Type': 'image/svg+xml; charset=utf-8',
					});
					scope.get('/twitter.svg-ECONNRESET').replyWithError({
						message: 'uh oh the connection reset',
						code: 'ECONNRESET',
					});
					scope
						.get('/twitter.svg-UNABLE_TO_VERIFY_LEAF_SIGNATURE')
						.replyWithError({
							message: 'Unable to verify the certificate',
							code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
						});
					scope.get('/twitter.svg-ERR_UNESCAPED_CHARACTERS').replyWithError({
						message: 'URL contains unescaped characters',
						code: 'ERR_UNESCAPED_CHARACTERS',
					});
					scope.get('/twitter.svg-ENETUNREACH').replyWithError({
						message: 'uh oh the network is unreachable',
						code: 'ENETUNREACH',
					});
					scope.get('/twitter.svg-EAI_AGAIN').replyWithError({
						message: 'uh oh the DNS lookup timed out',
						code: 'EAI_AGAIN',
					});
					scope.get('/twitter.svg-ESERVFAIL').replyWithError({
						message: 'The domain has no name server',
						code: 'ESERVFAIL',
					});
					scope.get('/twitter.svg-EBADNAME').replyWithError({
						message: 'The hostname is incorrect formatting',
						code: 'EBADNAME',
					});
					scope.get('/twitter.svg-ENOTFOUND').replyWithError({
						message: 'uh oh the domain has no dns record',
						code: 'ENOTFOUND',
					});
					scope.get('/twitter.svg-ETIMEDOUT').replyWithError({
						message: 'uh oh the connection timed out',
						code: 'ETIMEDOUT',
					});
					scope.get('/twitter.svg-CERT_HAS_EXPIRED').replyWithError({
						message:
							'Certificate has expired for "https://ft.com/twitter.svg-CERT_HAS_EXPIRED',
						code: 'CERT_HAS_EXPIRED',
					});
					scope
						.get('/twitter.svg-ERR_TLS_CERT_ALTNAME_INVALID')
						.replyWithError({
							message:
								"NodeError: Hostname/IP does not match certificate's altnames: Host: ft.com. is not in the cert's altnames: DNS: example.com",
							code: 'ERR_TLS_CERT_ALTNAME_INVALID',
						});
					scope
						.get('/twitter.svg-UNKNOWN_ERROR')
						.replyWithError(
							new Error(
								'Something went wrong here, we do not know what it what.'
							)
						);
				});

				context('due to no DNS record for the domain', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ENOTFOUND';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});

				context('due to the domain having no Name Server DNS record', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ESERVFAIL';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});

				context('due to the dns lookup timing out', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-EAI_AGAIN';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "30s"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '30s');
					});
				});
				context('due to the certificate being incorrect', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-UNABLE_TO_VERIFY_LEAF_SIGNATURE';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});

				context('due to the connection being reset', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ECONNRESET';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "30s"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '30s');
					});
				});

				context(
					'due to the image url hostname having incorrect formatting',
					() => {
						beforeEach(done => {
							next.resetHistory();
							mockImageTransform.getUri = () =>
								'https://ft.com/twitter.svg-EBADNAME';
							middleware(request, response, error => {
								next(error);
								done();
							});
						});

						it('calls `next` with an error', () => {
							assert.isTrue(next.calledOnce);
							assert.isInstanceOf(next.firstCall.firstArg, Error);
						});

						it('sets the error `skipSentry` property to true', () => {
							assert.isTrue(next.firstCall.firstArg.skipSentry);
						});

						it('sets the error `cacheMaxAge` property to "1y"', () => {
							assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '1y');
						});
					}
				);

				context('due to the image url having invalid characters', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ERR_UNESCAPED_CHARACTERS';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "1y"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '1y');
					});
				});

				context('due to the network being unreachable', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ENETUNREACH';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "30s"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '30s');
					});
				});

				context('due to the request timing out', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ETIMEDOUT';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '30s');
					});
				});

				context('due to the certificate having expired', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-CERT_HAS_EXPIRED';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});

				context('due to the certificate not having the domain listed', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-ERR_TLS_CERT_ALTNAME_INVALID';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});

				context('due to an unknown error', () => {
					beforeEach(done => {
						next.resetHistory();
						mockImageTransform.getUri = () =>
							'https://ft.com/twitter.svg-UNKNOWN_ERROR';
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('does not set the error `skipSentry` property', () => {
						assert.isUndefined(next.firstCall.firstArg.skipSentry);
					});

					it('does not set the error `cacheMaxAge` property', () => {
						assert.isUndefined(next.firstCall.firstArg.cacheMaxAge);
					});
				});
			});

			describe('when uploading the image to cloudinary fails', () => {
				context('due to the file being too large', () => {
					let scope;
					beforeEach(done => {
						scope = nock('https://ft.com').persist();

						scope.get('/twitter.svg').reply(200, 'svg-code-here', {
							'Content-Type': 'image/svg+xml; charset=utf-8',
						});
						mockImageTransform.getUri = () => 'https://ft.com/twitter.svg';
						next.resetHistory();
						cloudinary.v2.uploader.upload.yields(
							new Error(
								'File size too large. Got 222350285. Maximum is 104857600.'
							)
						);
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});

				context('due to the file being an invalid image file', () => {
					let scope;
					beforeEach(done => {
						scope = nock('https://ft.com').persist();

						scope.get('/twitter.svg').reply(200, 'svg-code-here', {
							'Content-Type': 'image/svg+xml; charset=utf-8',
						});
						mockImageTransform.getUri = () => 'https://ft.com/twitter.svg';
						next.resetHistory();
						cloudinary.v2.uploader.upload.yields(
							new Error('Invalid image file')
						);
						middleware(request, response, error => {
							next(error);
							done();
						});
					});

					it('calls `next` with an error', () => {
						assert.isTrue(next.calledOnce);
						assert.isInstanceOf(next.firstCall.firstArg, Error);
					});

					it('sets the error `skipSentry` property to true', () => {
						assert.isTrue(next.firstCall.firstArg.skipSentry);
					});

					it('sets the error `cacheMaxAge` property to "5m"', () => {
						assert.strictEqual(next.firstCall.firstArg.cacheMaxAge, '5m');
					});
				});
			});
		});
	});
});
