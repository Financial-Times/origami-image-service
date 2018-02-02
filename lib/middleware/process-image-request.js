'use strict';

const ImageTransform = require('../image-transform');
const cloudinaryTransform = require('../transformers/cloudinary');
const url = require('url');

module.exports = processImage;

function processImage(config) {
	return (request, response, next) => {
		let transform;
		// Add the URI from the path to the query so we can
		// pass it into the transform as one object
		request.query.uri = request.params.imageUrl;

		// Create an image transform based on the query. This
		// includes some validation
		try {
			transform = new ImageTransform(request.query);
		} catch (error) {
			error.status = 400;
			error.cacheMaxAge = '10m';
			return next(error);
		}

		// If the image is an SVG with a tint parameter then
		// we need to route it through the /images/svgtint
		// endpoint. This involves modifying the URI.
		if (transform.format === 'svg' || /\.svg/i.test(transform.uri)) {
			const hasQueryString = url.parse(transform.uri).search;
			const encodedUri = encodeURIComponent(transform.uri);
			// We only use the first comma-delimited tint colour
			// that we find, additional colours are obsolete
			const tint = (transform.tint ? transform.tint[0] : '');
			const hostname = (config.hostname || request.hostname);
			// TODO change svgtint to just svg now that it does more
			transform.setUri(`${request.protocol}://${hostname}/v2/images/svgtint/${encodedUri}${hasQueryString ? '&' : '?'}color=${tint}`);
			// Clear the tint so that SVGs converted to rasterised
			// formats don't get double-tinted
			if (transform.tint) {
				transform.setTint();
			}
		}

		if (request.params.immutable) {
			transform.setImmutable(true);
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
