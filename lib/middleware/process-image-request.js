const httpError = require('http-errors');
const cloudinaryTransform = require('../transformers/cloudinary');
const axios = require('axios').default;
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const promisify = require('util').promisify;
const createErrorFromAxiosError = require('../create-error-from-axios-error');
const getColorPair = require('../get-color-pair');
const makeTextForTransform = require('../make-text-for-transform');
const FileType = require('file-type');
const {
	createTransform,
	sanitizeSvgUri,
	setAvifSupport,
	setImmutableFlag,
} = require('./helpers/transformHelpers');

function processImage(config) {
	const imageUploadCache = Object.create(null);
	const imageMimeTypeCache = Object.create(null);

	cloudinary.config({
		cloud_name: config.cloudinaryAccountName,
		api_key: config.cloudinaryApiKey,
		api_secret: config.cloudinaryApiSecret,
	});

	const upload = promisify(
		cloudinary.uploader.upload.bind(cloudinary.uploader)
	);

	const generateText = promisify(
		cloudinary.uploader.text.bind(cloudinary.uploader)
	);

	return (request, response, next) => {
		const log = request.app.ft.log;
		let transform;

		// Put the imageUrl as part of the query uri
		request.query.uri = request.params.imageUrl;

		transform = createTransform(transform, request.query, next);

		sanitizeSvgUri(transform, config, request);
		setAvifSupport(transform, request);
		setImmutableFlag(transform, request.params.immutable);

		let transformReady = Promise.resolve();

		// 1. get image from destination
		const originalImageURI = transform.getUri();

		if (imageUploadCache[originalImageURI]) {
			const imageName = imageUploadCache[originalImageURI];
			transform.setName(imageName);
		} else if (request.params.imageMode === 'placeholder') {
			transform.setFit('fill');

			if (transform.getFormat() === 'svg') {
				transform.setFormat('auto');
			}

			const info = makeTextForTransform(transform);

			transform.type = 'text';

			if (imageUploadCache[info]) {
				transform.setName(imageUploadCache[info]);
			} else {
				const hash = crypto.createHash('sha256');
				hash.update(info);
				const imageName = hash.digest('hex');
				transform.setName(imageName);
				const [font_color, background] = getColorPair();

				// this is a little padding to make the text readable on
				// flagrantly unsquare images
				const ratio = transform.width / transform.height;
				let padding = '';
				if (ratio > 1) {
					padding += ' '.repeat(ratio * 5);
				} else if (ratio < 1) {
					padding += '\n'.repeat(1 / ratio);
				}
				transformReady = generateText(info + padding, {
					public_id: imageName,
					background,
					font_color,
					font_family: 'Roboto Mono',
					font_weight: 'bold',
					font_size: 256,
				}).then(() => {
					imageUploadCache[info] = imageName;
				});
			}
		} else {
			const imageURI = encodeURI(originalImageURI);
			const ergh =
				'https://next-media-api.ft.com/renditions/16318261237260/1280x720.mp4';
			if (imageURI === ergh) {
				const error = httpError('400');
				error.cacheMaxAge = '5m';
				error.skipSentry = true;
				throw error;
			}
			transformReady = axios
				.get(imageURI, {
					timeout: 20000, // 20 seconds
					validateStatus: function (status) {
						return status >= 200 && status < 600;
					},
					responseType: 'arraybuffer',
					headers: {
						range: 'bytes=0-1000',
						'User-Agent': `FTSystem/origami-image-service-v2 (${Math.random()})`,
					},
				})
				.then(
					async response => {
						const file = response.data;

						if (response.status >= 400) {
							log.info(
								`Failed to download image from destination (${response.status}) ${imageURI}`
							);
							const error = httpError(response.status);
							error.cacheMaxAge = '5m';
							error.skipSentry = true;
							throw error;
						}

						const type = await FileType.fromBuffer(file);
						if (type && type.mime.startsWith('video')) {
							const error = httpError(400);
							error.cacheMaxAge = '5m';
							error.skipSentry = true;
							throw error;
						}
						if (type && type.mime.startsWith('image/gif')) {
							transform.setFormat('auto');
						}

						return axios
							.get(imageURI, {
								timeout: 20000, // 20 seconds
								validateStatus: function (status) {
									return status >= 200 && status < 600;
								},
								responseType: 'arraybuffer',
								headers: {
									'User-Agent': `FTSystem/origami-image-service-v2 (${Math.random()})`,
								},
							})
							.then(
								async imageResponse => {
									if (imageResponse.status >= 400) {
										const error = httpError(imageResponse.status);
										error.cacheMaxAge = '5m';
										error.skipSentry = true;
										throw error;
									}
									if (
										typeof imageResponse.headers['content-type'] === 'string' &&
										imageResponse.headers['content-type'].includes('text/html')
									) {
										const error = httpError(400);
										error.cacheMaxAge = '5m';
										error.skipSentry = true;
										throw error;
									}
									const file = imageResponse.data;

									const type = await FileType.fromBuffer(file);
									if (type && type.mime.startsWith('video')) {
										const error = httpError(400);
										error.cacheMaxAge = '5m';
										error.skipSentry = true;
										throw error;
									}

									// 2. hash image
									const hash = crypto.createHash('sha256');
									hash.update(file);

									const imageName = hash.digest('hex');
									transform.setName(imageName);
									imageUploadCache[originalImageURI] = imageName;
									if (type && type.mime) {
										imageMimeTypeCache[originalImageURI] = type.mime;
									}

									// 3. upload the image to cloudinary - this will not error if the image has already been uploaded to cloudinary
									try {
										await upload(originalImageURI, {
											public_id: imageName,
											unique_filename: false,
											use_filename: false,
											resource_type: 'image',
											overwrite: false,
										});
									} catch (error) {
										console.error('uploading the image failed:', error);
										// Cloudinary unfortunately do not use an Error instance
										// they throw an object with a message property instead
										if (error.message.includes('File size too large.')) {
											error.skipSentry = true;
											error.cacheMaxAge = '5m';
										} else if (error.message.includes('Invalid image file')) {
											error.skipSentry = true;
											error.cacheMaxAge = '5m';
										}
										throw error;
									}
								},
								error => {
									const newError = createErrorFromAxiosError(error, imageURI);
									throw newError;
								}
							);
					},
					error => {
						const newError = createErrorFromAxiosError(error, imageURI);
						throw newError;
					}
				);
		}

		// Remove avif if mime type is gif
		const mimeType = imageMimeTypeCache[originalImageURI];
		if (mimeType && mimeType.startsWith('image/gif')) {
			transform.setFormat('auto');
		}

		transformReady
			.then(() => {
				// Create a Cloudinary transform
				const appliedTransform = cloudinaryTransform(transform, {
					cloudinaryAccountName: config.cloudinaryAccountName,
					cloudinaryApiKey: config.cloudinaryApiKey,
					cloudinaryApiSecret: config.cloudinaryApiSecret,
				});

				// Store the transform and applied transform for
				// use in later middleware
				request.transform = transform;
				request.appliedTransform = appliedTransform;
				next();
			})
			.catch(error => {
				console.error(error);
				next(error);
				return;
			});
	};
}

module.exports = processImage;
