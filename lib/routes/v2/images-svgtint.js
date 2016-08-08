'use strict';

const httpError = require('http-errors');
const httpRequest = require('request');
const SvgTintStream = require('svg-tint-stream');

module.exports = app => {

	// SVG tinting middleware
	function tintSvg(request, response, next) {
		const color = request.query.color || '#000';
		const uri = request.params[0];

		let tintStream;
		try {
			tintStream = new SvgTintStream({color});
		} catch (error) {
			error.status = 400;
			return next(error);
		}

		const imageRequest = httpRequest(uri);
		imageRequest
			.on('response', imageResponse => {
				if (imageResponse.statusCode >= 400) {
					return imageRequest.emit('error', httpError(imageResponse.statusCode));
				}
				if (imageResponse.headers['content-type'].indexOf('image/svg+xml') === -1) {
					return imageRequest.emit('error', httpError(400, 'URI must point to an SVG image'));
				}
				response.set('Content-Type', 'image/svg+xml; charset=utf-8');
			})
			.on('error', error => {
				return next(error);
			})
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
