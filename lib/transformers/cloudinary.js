'use strict';

const cloudinary = require('cloudinary');
const ImageTransform = require('../image-transform');

module.exports = cloudinaryTransform;

function cloudinaryTransform(transform, options = {}) {
	if (!(transform instanceof ImageTransform)) {
		throw new Error('Invalid transform argument, expected an ImageTransform object');
	}
	cloudinary.config({
		cloud_name: options.cloudinaryAccountName
	});
	return cloudinary.url(encodeURI(transform.getUri()), buildCloudinaryTransforms(transform));
}

function buildCloudinaryTransforms(transform) {
	const cloudinaryTransforms = {
		type: 'fetch',
		width: transform.getWidth(),
		height: transform.getHeight(),
		dpr: transform.getDpr(),
		format: transform.getFormat(),
		quality: transform.getQuality(),
		background: (transform.getBgcolor() ? `#${transform.getBgcolor()}` : undefined),
		crop: getCloudinaryCropStrategy(transform.getFit())
	};
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
