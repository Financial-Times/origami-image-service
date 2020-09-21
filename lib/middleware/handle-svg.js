'use strict';

const createDOMPurify = require('dompurify');
const httpError = require('http-errors');
const axios = require('axios').default;
const dnsLookup = require('lookup-dns-cache').lookup;
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
			},
			lookup: dnsLookup,
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
				// If the request errors, report this using
				// the standard error middleware
				if (error.code === 'ENOTFOUND') {
					error = new Error(`DNS lookup failed for "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'ESERVFAIL') {
					error = new Error(`"${uri}" has no DNS records`);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'EAI_AGAIN') {
					error = new Error(`DNS lookup timed out for "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'ECONNRESET') {
					const resetError = error;
					error = new Error(`Connection reset when requesting "${uri}" (${resetError.syscall})`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'ETIMEDOUT') {
					const timeoutError = error;
					error = new Error(`Request timed out when requesting "${uri}" (${timeoutError.syscall})`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'ECONNABORTED') {
					error = new Error(`Request timed out when requesting "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'CERT_HAS_EXPIRED') {
					error = new Error(`Certificate has expired for "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
					error = new Error(error.message);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'ENETUNREACH') {
					error = new Error(error.message);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
					error = new Error(`Unable to verify the first certificate for "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'ERR_UNESCAPED_CHARACTERS') {
					error = new Error(`Image url contains unescaped characters for "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '1y';
				}
				if (error.code === 'EBADNAME') {
					error = new Error(`Misformatted host name "${uri}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '1y';
				}
				hasErrored = true;
				return next(error);
			});
	};
}
