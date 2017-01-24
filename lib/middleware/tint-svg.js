'use strict';

const httpError = require('http-errors');
const httpRequest = require('request');
const SvgTintStream = require('svg-tint-stream');

module.exports = tintSvg;

function tintSvg() {
	return (request, response, next) => {

		// Grab the params we need for tinting
		const color = request.query.color || '#000';
		const uri = request.params[0];

		// Create a tint stream with the colour found in
		// the querystring. SvgTintStream deals with colour
		// validation here
		let tintStream;
		try {
			tintStream = new SvgTintStream({
				color,
				stroke: false
			});
		} catch (error) {
			error.status = 400;
			error.cacheMaxAge = '30s';
			return next(error);
		}

		// Request the original SVG image
		const imageRequest = httpRequest(uri);
		imageRequest
			// We listen for the response event so that we
			// can error properly and *early* if the URI
			// does not point to an SVG or it errors
			.on('response', imageResponse => {
				if (imageResponse.statusCode >= 400) {
					const error = httpError(imageResponse.statusCode);
					error.cacheMaxAge = '30s';
					return imageRequest.emit('error', error);
				}
				if (imageResponse.headers['content-type'].indexOf('image/svg+xml') === -1) {
					const error = httpError(400, 'URI must point to an SVG image');
					error.cacheMaxAge = '5m';
					return imageRequest.emit('error', error);
				}
				response.set('Content-Type', 'image/svg+xml; charset=utf-8');
			})
			// If the request errors, report this using
			// the standard error middleware
			.on('error', error => {
				return next(error);
			})
			// Pipe the image request through the tint
			// stream and into the response
			.pipe(tintStream)
			.pipe(response);
	};
}
