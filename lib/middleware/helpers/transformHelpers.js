const crypto = require('crypto');
const url = require('url');
const makeTextForTransform = require('../../make-text-for-transform');
const getColorPair = require('../../get-color-pair');
const FileType = require('file-type');
const axios = require('axios').default;
const httpError = require('http-errors');
const createErrorFromAxiosError = require('../../create-error-from-axios-error');

function sanitizeSvgUri(transform, config, request) {
	if (
		transform.uri &&
		(transform.format === 'svg' || /\.svg/i.test(transform.uri))
	) {
		const hasQueryString = url.parse(transform.uri).search;
		const encodedUri = encodeURIComponent(transform.uri);
		const tint = transform.tint ? transform.tint[0] : '';
		const hostname = config.hostname || request.hostname;
		const protocol = hostname === 'localhost' ? 'http' : 'https';
		const port = hostname === 'localhost' ? ':8080' : '';

		transform.setUri(
			`${protocol}://${hostname}${port}/__origami/service/image/v2/images/svgtint/${encodedUri}${
				hasQueryString ? '&' : '?'
			}color=${tint}`
		);

		// Clear the tint to avoid double tinting
		if (transform.tint) {
			transform.setTint();
		}
	}
}

function setAvifSupport(transform, request) {
	if (
		request.get('accept')?.includes('image/avif') &&
		transform.format === 'auto'
	) {
		transform.setFormat('avif');
	}
}

function setImmutableFlag(transform, isImmutable) {
	if (isImmutable) {
		transform.setImmutable(true);
	}
}

function transformIfPlaceholder(
	transform,
	transformReady,
	generateText,
	imageUploadCache
) {
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
}

const transformReadyFunction = async (
	response,
	imageURI,
	log,
	transform,
	upload,
	originalImageURI,
	imageUploadCache,
	imageMimeTypeCache
) => {
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
};

module.exports = {
	sanitizeSvgUri,
	setAvifSupport,
	setImmutableFlag,
	transformIfPlaceholder,
	transformReadyFunction,
};
