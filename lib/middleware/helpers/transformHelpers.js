const crypto = require('crypto');
const url = require('url');
const makeTextForTransform = require('../../make-text-for-transform');
const getColorPair = require('../../get-color-pair');
const FileType = require('file-type');
const axios = require('axios').default;
const {handleHttpError, handleErrorDuringDownload} = require('./errorHelpers');

/**
 * Take the request and transform object and modify the transform object if the URI and format are SVG.
 * @param {Object} transform
 * @param {Object} config
 * @param {Object} request
 */
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

/**
 * Manually set AVIF support as Cloudinary f_auto does not support it.
 * @param {Object} transform
 * @param {Object} request
 */
function setAvifSupport(transform, request) {
	if (
		request.get('accept')?.includes('image/avif') &&
		transform.format === 'auto'
	) {
		transform.setFormat('avif');
	}
}

/**
 * Set the immutable flag on the transform object.
 * @param {Object} transform
 * @param {String} isImmutable
 */
function setImmutableFlag(transform, isImmutable) {
	if (isImmutable) {
		transform.setImmutable(true);
	}
}

/**
 * Generate a hash from the data provided
 * @param {Object} data
 * @returns
 */
function generateHash(data) {
	const hash = crypto.createHash('sha256');
	hash.update(data);
	return hash.digest('hex');
}

/**
 * Calculate the padding based on the ratio provided
 * @param {String} ratio
 * @returns
 */
function calculatePadding(ratio) {
	if (ratio > 1) {
		return ' '.repeat(ratio * 5);
	} else if (ratio < 1) {
		return '\n'.repeat(1 / ratio);
	}
	return '';
}

/**
 * This function is used to generate placeholder images for text-based transformations.
 * @param {Object} transform
 * @param {Object} transformReady
 * @param {Function} generateText
 * @param {Object} imageUploadCache
 */
async function transformIfPlaceholder(
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

	// Check if the image is already uploaded
	if (imageUploadCache[info]) {
		transform.setName(imageUploadCache[info]);
	} else {
		// Otherwise, generate the image
		const imageName = generateHash(info);
		transform.setName(imageName);

		const [font_color, background] = getColorPair();
		const padding = calculatePadding(transform.width / transform.height);

		transformReady = await generateText(info + padding, {
			public_id: imageName,
			background,
			font_color,
			font_family: 'Roboto Mono',
			font_weight: 'bold',
			font_size: 256,
		});

		imageUploadCache[info] = imageName;
	}
}

/**
 * This function is used to download the image from the destination and upload it to Cloudinary.
 * @param {*} response
 * @param {*} imageURI
 * @param {*} log
 * @param {*} transform
 * @param {*} upload
 * @param {*} originalImageURI
 * @param {*} imageUploadCache
 * @param {*} imageMimeTypeCache
 */
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
	try {
		const file = response.data;

		if (response.status >= 400) {
			log.info(
				`Failed to download image from destination (${response.status}) ${imageURI}`
			);
			handleHttpError(response.status);
		}

		const type = await FileType.fromBuffer(file);
		if (type && type.mime.startsWith('video')) {
			handleHttpError(400);
		}
		if (type && type.mime.startsWith('image/gif')) {
			transform.setFormat('auto');
		}

		const imageResponse = await axios.get(imageURI, {
			timeout: 20000,
			validateStatus: status => status >= 200 && status < 600,
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': `FTSystem/origami-image-service-v2 (${Math.random()})`,
			},
		});

		if (imageResponse.status >= 400) {
			handleHttpError(imageResponse.status);
		}

		if (
			typeof imageResponse.headers['content-type'] === 'string' &&
			imageResponse.headers['content-type'].includes('text/html')
		) {
			handleHttpError(400);
		}

		const imageFile = imageResponse.data;
		const imageType = await FileType.fromBuffer(imageFile);
		if (imageType && imageType.mime.startsWith('video')) {
			handleHttpError(400);
		}

		const imageName = generateHash(imageFile);
		transform.setName(imageName);
		imageUploadCache[originalImageURI] = imageName;

		if (imageType && imageType.mime) {
			imageMimeTypeCache[originalImageURI] = imageType.mime;
		}

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
	} catch (error) {
		handleErrorDuringDownload(error, imageURI);
	}
};

module.exports = {
	sanitizeSvgUri,
	setAvifSupport,
	setImmutableFlag,
	transformIfPlaceholder,
	transformReadyFunction,
};
