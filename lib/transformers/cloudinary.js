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
	return cloudinary.url(transform.getName() || encodeURI(transform.getUri()), buildCloudinaryTransforms(transform));
}

function buildCloudinaryTransforms(transform) {
	const cloudinaryTransforms = {
		type: transform.type || 'upload',
		// Always use the secure API
		secure: true,

		// Sign image URLs
		sign_url: true,

		// Flags to improve image file sizes/compression
		// https://cloudinary.com/documentation/image_transformation_reference#flags_parameter
		flags: [
			'lossy', // convery png to jpeg if it has no alpha channel (no transparency)
			'any_format', // allow switching to PNG8 encoding
			'force_strip', // always strip image meta-data
			'progressive' // send progressive images
		],

		// Transforms
		width: transform.getWidth(),
		height: transform.getHeight(),
		dpr: transform.getDpr(),
		fetch_format: transform.getFormat(),
		quality: transform.getQuality(),
		background: (transform.getBgcolor() ? `#${transform.getBgcolor()}` : undefined),
		crop: getCloudinaryCropStrategy(transform.getFit()),
		gravity: getCloudinaryGravity(transform.getGravity())
	};
	const tint = transform.getTint();
	if (tint) {
		cloudinaryTransforms.effect = `tint:100:${tint.join(':')}`;
	}

	const overlay = transform.getOverlay();

	const immutable = transform.getImmutable();
	if (immutable) {
		cloudinaryTransforms.flags.push('immutable_cache');
	}

	if (overlay) {

		const overlayTransform = [];

		overlayTransform.push(
			{ overlay: { 'url': overlay } },
			{ flags: 'relative', height: '0.10', crop: 'scale' },
			{ flags: ['layer_apply', 'no_overflow'],
			gravity: 'south_east', x: 0, y: 30 }
		);

		return {transformation: [cloudinaryTransforms, overlayTransform]};
	} else {
		return cloudinaryTransforms;
	}


}

function getCloudinaryCropStrategy(cropStrategy) {
	const cropStrategyMap = {
		contain: 'fit',
		cover: 'fill',
		fill: 'scale',
		'scale-down': 'limit',
		pad: 'pad'
	};
	return cropStrategyMap[cropStrategy];
}

function getCloudinaryGravity(gravity) {
	const gravityMap = {
		faces: 'auto:faces',
		poi: 'auto:no_faces'
	};
	return gravityMap[gravity];
}
