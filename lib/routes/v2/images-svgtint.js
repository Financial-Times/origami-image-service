'use strict';

const httpError = require('http-errors');
const httpRequest = require('request');
const SvgTintStream = require('svg-tint-stream');

module.exports = app => {

	// SVG tinting middleware
	function tintSvg(request, response, next) {
		const color = request.query.color || '#000';
		const uri = request.params[0];

		// Create a tint stream with the colour found in
		// the querystring. SvgTintStream deals with colour
		// validation here
		let tintStream;
		try {
			tintStream = new SvgTintStream({color});
		} catch (error) {
			error.status = 400;
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
					return imageRequest.emit('error', httpError(imageResponse.statusCode));
				}
				if (imageResponse.headers['content-type'].indexOf('image/svg+xml') === -1) {
					return imageRequest.emit('error', httpError(400, 'URI must point to an SVG image'));
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
	}

	// Image with an HTTP or HTTPS scheme, matches:
	// /v2/images/svgtint/https://...
	// /v2/images/svgtint/http://...
	app.get(
		/\/v2\/images\/svgtint\/(https?(:|%3A).*)$/,
		tintSvg
	);

};
