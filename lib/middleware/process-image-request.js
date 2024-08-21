const cloudinaryTransform = require('../transformers/cloudinary');
const axios = require('axios').default;
const createErrorFromAxiosError = require('../create-error-from-axios-error');
const ImageTransform = require('../image-transform');
const {
	sanitizeSvgUri,
	setAvifSupport,
	setImmutableFlag,
	transformIfPlaceholder,
	transformReadyFunction,
} = require('./helpers/transformHelpers');
const cloudinarySetup = require('./helpers/cloudinaryHelper');

const imageUploadCache = Object.create(null);
const imageMimeTypeCache = Object.create(null);

function processImage(config) {
	const {upload, generateText} = cloudinarySetup(config);

	return (request, response, next) => {
		const log = request.app.ft.log;
		let transform;

		// Put the imageUrl as part of the query uri
		request.query.uri = request.params.imageUrl;

		// Instantiate an ImageTransform object based on the query
		try {
			transform = new ImageTransform(request.query);
		} catch (error) {
			error.status = 400;
			error.cacheMaxAge = '1y';
			return next(error);
		}

		// These functions are used to modify the transform object based on the request
		sanitizeSvgUri(transform, config, request);
		setAvifSupport(transform, request);
		setImmutableFlag(transform, request.params.immutable);

		let transformReady = Promise.resolve();

		// Get image from destination
		const originalImageURI = transform.getUri();

		// Check if image is already uploaded
		if (imageUploadCache[originalImageURI]) {
			const imageName = imageUploadCache[originalImageURI];
			transform.setName(imageName);
		}

		// Check the params contain a placeholder in the imageMode request
		if (request.params.imageMode === 'placeholder') {
			transformIfPlaceholder(
				transform,
				transformReady,
				generateText,
				imageUploadCache
			);
		} else {
			const imageURI = encodeURI(originalImageURI);

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
					async response =>
						await transformReadyFunction(
							response,
							imageURI,
							log,
							transform,
							upload,
							originalImageURI,
							imageUploadCache,
							imageMimeTypeCache
						),
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
