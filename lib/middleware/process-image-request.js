'use strict';

const httpError = require('http-errors');
const ImageTransform = require('../image-transform');
const cloudinaryTransform = require('../transformers/cloudinary');
const url = require('url');
const axios = require('axios').default;
const dnsLookup = require('lookup-dns-cache').lookup;
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const promisify = require('util').promisify;

module.exports = processImage;

function processImage(config) {
	const cache = Object.create(null);
	cloudinary.config({
		cloud_name: config.cloudinaryAccountName,
		api_key: config.cloudinaryApiKey,
		api_secret: config.cloudinaryApiSecret
	});
	const upload = promisify(cloudinary.uploader.upload.bind(cloudinary.uploader));
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
			error.cacheMaxAge = '1y';
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
			const protocol = (hostname === 'localhost' ? 'http' : 'https');
			// TODO change svgtint to just svg now that it also sanitizes svgs.
			transform.setUri(`${protocol}://${hostname}/v2/images/svgtint/${encodedUri}${hasQueryString ? '&' : '?'}color=${tint}`);
			// Clear the tint so that SVGs converted to rasterised
			// formats don't get double-tinted
			if (transform.tint) {
				transform.setTint();
			}
		}

		if (request.params.immutable) {
			transform.setImmutable(true);
		}

		let transformReady = Promise.resolve();
		// 1. get image from destination
		const originalImageURI = transform.getUri();
		if (cache[originalImageURI]) {
			const imageName = cache[originalImageURI];
			transform.setName(imageName);
		} else {
			transformReady = axios.get(encodeURI(originalImageURI), {
				timeout: 20000, // 20 seconds
				validateStatus: function (status) {
					return status >= 200 && status < 600;
				},
				responseType: 'arraybuffer',
				lookup: dnsLookup,
			}).then(async imageResponse => {
				if (imageResponse.status >= 400) {
					const error = httpError(imageResponse.status);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}
				if (imageResponse.headers['content-type'].includes('text/html')) {
					const error = httpError(400);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}
				const file = imageResponse.data;

				// 2. hash image
				const hash = crypto.createHash('sha256');
				hash.update(file);

				const imageName = hash.digest('hex');
				transform.setName(imageName);
				cache[originalImageURI] = imageName;

				// 3. upload the image to cloudinary - this will not error if the image has already been uploaded to cloudinary
				try {
					await upload(originalImageURI, {
						public_id: imageName,
						unique_filename: false,
						use_filename: false,
						resource_type: 'image',
						overwrite: false
					});
				} catch (error) {
					console.error('uploading the image failed:', error);
					// Cloudinary unfortunately do not use an Error instance
					// they throw an object with a message property instead
					if (error.message.includes('File size too large.')) {
						error.skipSentry = true;
						error.cacheMaxAge = '5m';
					} else if (error.message.includes('Invalid image file')) {
						error.skipSentry = true;
						error.cacheMaxAge = '5m';
					}
					throw error;
				}

			}, error => {
				// If the request errors, report this using
				// the standard error middleware
				if (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo') {
					error = new Error(`DNS lookup failed for "${encodeURI(originalImageURI)}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'ECONNRESET') {
					const resetError = error;
					error = new Error(`Connection reset when requesting "${encodeURI(originalImageURI)}" (${resetError.syscall})`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'ETIMEDOUT') {
					const timeoutError = error;
					error = new Error(`Request timed out when requesting "${encodeURI(originalImageURI)}" (${timeoutError.syscall})`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'ECONNABORTED') {
					error = new Error(`Request timed out when requesting "${encodeURI(originalImageURI)}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '30s';
				}
				if (error.code === 'CERT_HAS_EXPIRED') {
					error = new Error(`Certificate has expired for "${encodeURI(originalImageURI)}"`);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
					error = new Error(error.message);
					error.skipSentry = true;
					error.cacheMaxAge = '5m';
				}
				throw error;
			});
		}

		transformReady.then(() => {
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
		}).catch(error => {
			console.error(error);
			next(error);
			return;
		});
	};
}
