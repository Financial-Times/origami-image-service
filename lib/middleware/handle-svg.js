'use strict';

const createDOMPurify = require('dompurify');
const httpError = require('http-errors');
const axios = require('axios').default;
const {JSDOM} = require('jsdom');
const SvgTintStream = require('svg-tint-stream');

let window;
let DOMPurify;

module.exports = handleSvg;

function handleSvg() {
	return (request, response, next) => {

		// Grab the params we need for tinting
		const color = request.query.color || null;
		const uri = request.params[0];
		const isWhitelisted = (
			uri.startsWith('https://origami-images.ft.com/') ||
			uri.startsWith('https://www.ft.com/__assets/')
		);
		let hasErrored = false;

		// Create a tint stream with the colour found in
		// the querystring. SvgTintStream deals with colour
		// validation here
		let tintStream;
		if (color) {
			try {
				tintStream = new SvgTintStream({
					color,
					stroke: false
				});
			} catch (error) {
				error.status = 400;
				error.cacheMaxAge = '1y';
				hasErrored = true;
				return next(error);
			}
		}

		// Request the original SVG image
		const imageRequest = axios(uri, {
			method: 'get',
			responseType: 'stream',
			timeout: 25000,
			validateStatus: function (status) {
				return status >= 200 && status < 600;
			}
		});

		imageRequest
			// We listen for the response event so that we
			// can error properly and *early* if the URI
			// does not point to an SVG or it errors
			.then(imageResponse => {
				if (imageResponse.status >= 400) {
					const error = httpError(imageResponse.status);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				} else if (imageResponse.headers['content-type'].indexOf('image/svg+xml') === -1) {
					const error = httpError(400, 'URI must point to an SVG image');
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				} else {
					response.set('Content-Type', 'image/svg+xml; charset=utf-8');
					let imageStream = imageResponse.data;
					// Pipe the image request through the tint stream
					if (tintStream) {
						imageStream = imageResponse.data.pipe(tintStream);
					}

					// Temporary fix: load the entire SVG in and error if
					// there are unsafe elements
					let entireSvg = '';
					imageStream.on('data', chunk => {
						entireSvg += chunk.toString();
					});
					imageStream.on('end', () => {
						if (!hasErrored) {
							if (!window || !DOMPurify) {
								window = (new JSDOM('')).window;
								DOMPurify = createDOMPurify(window);
							}

							// Clean the SVG if required
							if (isWhitelisted) {
								response.send(entireSvg);
							} else {
								response.send(DOMPurify.sanitize(entireSvg));
							}
						}
					});
				}
			})
			// If the request errors, report this using
			// the standard error middleware
			.catch(error => {
				if (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo') {
					error = new Error(`DNS lookup failed for "${uri}"`);
					error.skipSentry = true;
				}
				if (error.code === 'ECONNRESET') {
					const resetError = error;
					error = new Error(`Connection reset when requesting "${uri}" (${resetError.syscall})`);
				}
				if (error.code === 'ETIMEDOUT') {
					const timeoutError = error;
					error = new Error(`Request timed out when requesting "${uri}" (${timeoutError.syscall})`);
				}
				hasErrored = true;
				return next(error);
			});
	};
}
