'use strict';

const httpError = require('http-errors');
const ImageTransform = require('../image-transform');
const cloudinaryTransform = require('../transformers/cloudinary');
const url = require('url');
const axios = require('axios').default;
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
	const resource = promisify(cloudinary.api.resource.bind(cloudinary.api));
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
				timeout: 10000, // 10 seconds
				validateStatus: function (status) {
					return status >= 200 && status < 600;
				},
				responseType: 'arraybuffer'
			}).then(async imageResponse => {
				if (imageResponse.status >= 400) {
					const error = httpError(imageResponse.status);
					error.skipSentry = true;
					throw error;
				}
				if (imageResponse.headers['content-type'].includes('text/html')) {
					const error = httpError(400);
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
				
				// 3. check cloudinary to see if image with name exists
				let imageAlreadyUploadedToCloudinary = false;
				try {
					imageAlreadyUploadedToCloudinary = await resource(imageName);
				} catch (imageAlreadyUploadedToCloudinaryError) {
					// errors will be thrown if either the resource does not exist or if the cloudinary api rate-limit has been reached.
					// both of those errors are safe to ignore because the upload call below does not have a rate-limit.
				}

				// 4. upload image to cloudinary if it is not already uploaded.
				if (!imageAlreadyUploadedToCloudinary) {
					await upload(originalImageURI, {
						public_id: imageName,
						unique_filename: false,
						overwrite: true,
						use_filename: false,
						resource_type: 'image'
					});
				}
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
