

const createDOMPurify = require('dompurify');
const httpError = require('http-errors');
const axios = require('axios').default;
const {JSDOM} = require('jsdom');
const SvgTintStream = require('svg-tint-stream');
const createErrorFromAxiosError = require('../create-error-from-axios-error');

let window;
let DOMPurify;

module.exports = handleSvg;

function handleSvg(config = {}) {
	const CUSTOM_SCHEME_STORE = config.customSchemeStore;
	return (request, response, next) => {
		// Grab the params we need for tinting
		const color = request.query.color || null;
		const uri = request.params[0];
		let isTrustedDestination = false;
		if (uri.startsWith('https://www.ft.com/__assets/')) {
			isTrustedDestination = true;
		} else if (CUSTOM_SCHEME_STORE && uri.startsWith(CUSTOM_SCHEME_STORE)) {
			isTrustedDestination = true;
		}
		let hasErrored = false;

		// Create a tint stream with the colour found in
		// the querystring. SvgTintStream deals with colour
		// validation here
		let tintStream;
		if (color) {
			try {
				tintStream = new SvgTintStream({
					color,
					stroke: false,
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
			headers: {
				'User-Agent': 'FTSystem/origami-image-service-v2',
			},
			validateStatus: function (status) {
				return status >= 200 && status < 600;
			},
		});

		imageRequest
			// We listen for the response event so that we
			// can error properly and *early* if the URI
			// does not point to an SVG or it errors
			.then(imageResponse => {
				if (imageResponse.status >= 400) {
					const error = httpError(imageResponse.status);
					error.cacheMaxAge = '5m';
					throw error;
				} else if (
					imageResponse.headers['content-type'].indexOf('image/svg+xml') === -1
				) {
					const error = httpError(400, 'URI must point to an SVG image');
					error.cacheMaxAge = '5m';
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
								window = new JSDOM('').window;
								DOMPurify = createDOMPurify(window);
							}

							// Clean the SVG if required
							if (isTrustedDestination) {
								response.send(entireSvg);
							} else {
								response.send(DOMPurify.sanitize(entireSvg,{
									FORBID_TAGS: ['a'],
									USE_PROFILES: {
										svg: true
									}
								}));
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
				hasErrored = true;
				const newError = createErrorFromAxiosError(error, uri);
				return next(newError);
			});
	};
}
