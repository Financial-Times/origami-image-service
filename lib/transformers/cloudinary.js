'use strict';

const cloudinary = require('cloudinary');
const ImageTransform = require('../image-transform');

module.exports = cloudinaryTransform;

function cloudinaryTransform(transform, options = {}) {
	if (!(transform instanceof ImageTransform)) {
		throw new Error('Invalid transform argument, expected an ImageTransform object');
	}
	cloudinary.config({
		cloud_name: options.cloudinaryAccountName,
		api_key: options.cloudinaryApiKey,
		api_secret: options.cloudinaryApiSecret
	});
	return cloudinary.url(encodeURI(transform.getUri()), buildCloudinaryTransforms(transform));
}

function buildCloudinaryTransforms(transform) {
	const cloudinaryTransforms = {

		// Use fetch to automatically retrieve images
		type: 'fetch',

		// Always use the secure API
		secure: true,

		// Sign image URLs
		sign_url: true,

		// Flags to improve image file sizes/compression
		// http://cloudinary.com/documentation/image_transformation_reference#flags_parameter
		flags: [
			'any_format', // allow switching to PNG8 encoding
			'force_strip', // always strip image meta-data
			'progressive' // send progressive images
		],

		// Transforms
		width: transform.getWidth(),
		height: transform.getHeight(),
		dpr: transform.getDpr(),
		format: transform.getFormat(),
		quality: transform.getQuality(),
		background: (transform.getBgcolor() ? `#${transform.getBgcolor()}` : undefined),
		crop: getCloudinaryCropStrategy(transform.getFit())
	};
	const tint = transform.getTint();
	if (tint) {
		cloudinaryTransforms.effect = `tint:100:${tint.join(':')}`;
	}
	return cloudinaryTransforms;
}

function getCloudinaryCropStrategy(cropStrategy) {
	const cropStrategyMap = {
		contain: 'fit',
		cover: 'fill',
		'scale-down': 'limit'
	};
	return cropStrategyMap[cropStrategy];
}
