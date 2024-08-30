

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
	console.dir(buildCloudinaryTransforms(transform), {depth: null});
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

		// Disable addition of _a= analytics tracker to URL
		urlAnalytics: false,

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

	const immutable = transform.getImmutable();
	if (immutable) {
		cloudinaryTransforms.flags.push('immutable_cache');
	}

	const overlay = transform.getOverlay();

	if (overlay) {

		const overlayHeight = transform.getOverlayHeight() ? transform.getOverlayHeight() : '';
		const overlayWidth = transform.getOverlayWidth() ? transform.getOverlayWidth() : '';
		const overlayX = transform.getOverlayX() ? transform.getOverlayX() : 0;
		const overlayY = transform.getOverlayY() ? transform.getOverlayY() : 0;
		const overlayGravity = transform.getOverlayGravity();
		const overlayCrop = transform.getOverlayCrop();
		const overlayTransform = [];

		overlayTransform.push(
			{ overlay: { 'url': overlay } },
			// relative flag as it's sized relative to the parent image
			{ flags: 'relative', height: overlayHeight, width: overlayWidth, crop: overlayCrop },
			// these are here to make sure the overlay never flows over the original image
			{ flags: ['layer_apply', 'no_overflow'],
			gravity: overlayGravity, x: overlayX, y: overlayY }
		);

		return {
			transformation: [cloudinaryTransforms, overlayTransform], urlAnalytics: false
		};
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
