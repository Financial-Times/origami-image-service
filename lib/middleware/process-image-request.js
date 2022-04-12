'use strict';

const httpError = require('http-errors');
const ImageTransform = require('../image-transform');
const cloudinaryTransform = require('../transformers/cloudinary');
const url = require('url');
const axios = require('axios').default;
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const promisify = require('util').promisify;
const createErrorFromAxiosError = require('../create-error-from-axios-error');
const getColorPair = require('../get-color-pair');
const makeTextForTransform = require('../make-text-for-transform');
const FileType = require('file-type');

module.exports = processImage;

function processImage(config) {
	const cache = Object.create(null);

	cloudinary.config({
		cloud_name: config.cloudinaryAccountName,
		api_key: config.cloudinaryApiKey,
		api_secret: config.cloudinaryApiSecret,
	});

	const upload = promisify(
		cloudinary.uploader.upload.bind(cloudinary.uploader)
	);

	const generateText = promisify(
		cloudinary.uploader.text.bind(cloudinary.uploader)
	);

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

		// If the image is an SVG then we need to route it through
		// the /images/svgtint endpoint to santize the SVG and
		// tint it if required. This involves modifying the URI.
		if (
			(transform.uri && transform.format === 'svg') ||
			/\.svg/i.test(transform.uri)
		) {
			const hasQueryString = url.parse(transform.uri).search;
			const encodedUri = encodeURIComponent(transform.uri);

			// We only use the first comma-delimited tint colour
			// that we find, additional colours are obsolete
			const tint = transform.tint ? transform.tint[0] : '';
			const hostname = config.hostname || request.hostname;
			const protocol = hostname === 'localhost' ? 'http' : 'https';

			// TODO change svgtint to just svg now that it also sanitizes svgs.
			transform.setUri(
				`${protocol}://${hostname}/__origami/service/image/v2/images/svgtint/${encodedUri}${hasQueryString ? '&' : '?'
				}color=${tint}`
			);
			// Clear the tint so that SVGs converted to rasterised
			// formats don't get double-tinted
			if (transform.tint) {
				transform.setTint();
			}
		}

		// Cloudinary do not yet support automatic avif support via f_auto which is why we are
		// manually setting avif support if the browser supports avif and the request was set to auto.
		// This code could be removed if/when cloudinary enable automatic avif support via f_auto:
		// https://cloudinary.com/blog/how_to_adopt_avif_for_images_with_cloudinary#how_do_i_do_that
		if (request.get('accept') && request.get('accept').includes('image/avif') && transform.format === 'auto') {
			transform.setFormat('avif');
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
		} else if (request.params.imageMode === 'placeholder') {
			transform.setFit('fill');

			if (transform.getFormat() === 'svg') {
				transform.setFormat('auto');
			}

			const info = makeTextForTransform(transform);

			transform.type = 'text';

			if (cache[info]) {
				transform.setName(cache[info]);
			} else {
				const hash = crypto.createHash('sha256');
				hash.update(info);
				const imageName = hash.digest('hex');
				transform.setName(imageName);
				const [font_color, background] = getColorPair();

				// this is a little padding to make the text readable on
				// flagrantly unsquare images
				const ratio = transform.width / transform.height;
				let padding = '';
				if (ratio > 1) {
					padding += ' '.repeat(ratio * 5);
				} else if (ratio < 1) {
					padding += '\n'.repeat(1 / ratio);
				}
				transformReady = generateText(info + padding, {
					public_id: imageName,
					background,
					font_color,
					font_family: 'Roboto Mono',
					font_weight: 'bold',
					font_size: 256,
				}).then(() => {
					cache[info] = imageName;
				});
			}
		} else {
			const imageURI = encodeURI(originalImageURI);
			const ergh = 'https://next-media-api.ft.com/renditions/16318261237260/1280x720.mp4';
			if (imageURI === ergh) {
				const error = httpError('400');
				error.cacheMaxAge = '5m';
				error.skipSentry = true;
				throw error;
			}
			transformReady = axios
			.get(imageURI, {
				timeout: 20000, // 20 seconds
				validateStatus: function(status) {
					return status >= 200 && status < 600;
				},
				responseType: 'arraybuffer',
				headers: {
					'range': 'bytes=0-1000'
				}
			}).then(async response => {
				const file = response.data;

				if (response.status >= 400) {
					const error = httpError(response.status);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}

				const type = await FileType.fromBuffer(file);
				if (type && type.mime.startsWith('video')) {
					const error = httpError(400);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}
				if (type && type.mime.startsWith('image/gif')) {
					transform.setFormat('auto');
				}

				return axios
					.get(imageURI, {
						timeout: 20000, // 20 seconds
						validateStatus: function(status) {
							return status >= 200 && status < 600;
						},
						responseType: 'arraybuffer',
					})
					.then(
						async (imageResponse) => {
							if (imageResponse.status >= 400) {
								const error = httpError(imageResponse.status);
								error.cacheMaxAge = '5m';
								error.skipSentry = true;
								throw error;
							}
							if (
								typeof imageResponse.headers['content-type'] === 'string' &&
								imageResponse.headers['content-type'].includes('text/html')
							) {
								const error = httpError(400);
								error.cacheMaxAge = '5m';
								error.skipSentry = true;
								throw error;
							}
							const file = imageResponse.data;

							const type = await FileType.fromBuffer(file);
							if (type && type.mime.startsWith('video')) {
								const error = httpError(400);
								error.cacheMaxAge = '5m';
								error.skipSentry = true;
								throw error;
							}

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
									overwrite: false,
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
						},
						(error) => {
							const newError = createErrorFromAxiosError(
								error,
								imageURI
							);
							throw newError;
						}
					);
			},
			(error) => {
				const newError = createErrorFromAxiosError(
					error,
					imageURI
				);
				throw newError;
			});
		}

		transformReady
			.then(() => {
				// Create a Cloudinary transform
				const appliedTransform = cloudinaryTransform(transform, {
					cloudinaryAccountName: config.cloudinaryAccountName,
					cloudinaryApiKey: config.cloudinaryApiKey,
					cloudinaryApiSecret: config.cloudinaryApiSecret,
				});

				// Store the transform and applied transform for
				// use in later middleware
				request.transform = transform;
				request.appliedTransform = appliedTransform;
				next();
			})
			.catch((error) => {
				console.error(error);
				next(error);
				return;
			});
	};
}
