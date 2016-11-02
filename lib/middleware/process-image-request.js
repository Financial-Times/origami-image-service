'use strict';

const ImageTransform = require('../image-transform');
const cloudinaryTransform = require('../transformers/cloudinary');
const httpError = require('http-errors');

module.exports = processImage;

function processImage(config) {
	return (request, response, next) => {
		let transform;

		// Add the URI from the path to the query so we can
		// pass it into the transform as one object
		request.query.uri = request.params[0];

		// Create an image transform based on the query. This
		// includes some validation
		try {
			transform = new ImageTransform(request.query);
		} catch (error) {
			error.status = 400;
			return next(error);
		}
		if (!request.query.source) {
			return next(httpError(400, 'The source parameter is required'));
		}

		// If the image is an SVG with a tint parameter then
		// we need to route it through the /images/svgtint
		// endpoint. This involves modifying the URI.
		if ((transform.format === 'svg' || /\.svg/i.test(transform.uri)) && transform.tint) {
			const encodedUri = encodeURIComponent(transform.uri);
			// We only use the first comma-delimited tint colour
			// that we find, additional colours are obsolete
			const tint = transform.tint[0];
			const hostname = (config.hostname || request.hostname);
			const basePath = config.basePath || '';
			transform.setUri(`${request.protocol}://${hostname}${basePath}/v2/images/svgtint/${encodedUri}?color=${tint}`);
			// Clear the tint so that SVGs converted to rasterised
			// formats don't get double-tinted
			transform.setTint();
		}

		// Create a Cloudinary transform
		const appliedTransform = cloudinaryTransform(transform, {
			cloudinaryAccountName: config.cloudinaryAccountName,
			cloudinaryApiKey: config.cloudinaryApiKey,
			cloudinaryApiSecret: config.cloudinaryApiSecret
		});

		// Store the transform and applied transform for
		// use in later middleware
		request.transform = transform;
		request.appliedTransform = appliedTransform;
		next();
	};
}
