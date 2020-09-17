'use strict';

const httpError = require('http-errors');
const axios = require('axios').default;
const dnsLookup = require('lookup-dns-cache').lookup;

module.exports = getCmsUrl;

function getCmsUrl(config) {
	const cache = Object.create(null);
	return (request, response, next) => {

		if (!request.params.imageUrl.startsWith('ftcms')) {
			return next();
		}

		const log = request.app.ft.log;

		// Grab the CMS ID and construct the v1 and v2 API URLs
		const uriParts = request.params.imageUrl.split(':').pop().split('?');
		const cmsId = uriParts.shift();
		const query = (uriParts.length ? '?' + uriParts.join('?') : '');
		const v1Uri = `http://im.ft-static.com/content/images/${cmsId}.img${query}`;
		const v2Uri = `http://prod-upp-image-read.ft.com/${cmsId}${query}`;
		const capi = `https://api.ft.com/enrichedcontent/${cmsId}${query}`;
		request.params.schemeUrl = `ftcms:${cmsId}`;

		// Keep track of which API we last checked
		let lastRequestedUri = v2Uri;
		let cmsVersionUsed = null;

		if (cache[cmsId]) {
			const cmsURL = cache[cmsId];
			log.info(`ftcms-check cmsId=${cmsId} cached`);
			request.params.imageUrl = cmsURL;
			next();
		} else {
			// First try fetching from Content API
			axios.get(capi, {
				headers: {
					'x-api-key': config.contentApiKey
				},
				timeout: 10000, // 10 seconds
				validateStatus: function (status) {
					return status >= 200 && status < 600;
				},
				lookup: dnsLookup,
			})
			.then(response => {
				if (response.status <= 400) {
					if (response.data && response.data.binaryUrl && response.data.binaryUrl.length > 0) {
						return response.data.binaryUrl;
					}
				}
				// Second try fetching from Content API v2
				return axios.head(v2Uri,{
						timeout: 10000, // 10 seconds
						validateStatus: function (status) {
							return status >= 200 && status < 600;
						},
						lookup: dnsLookup,
					})
					.then(firstResponse => {
						// Cool, we've got an image from v2
						if (firstResponse.status <= 400) {
							cmsVersionUsed = 'v2';
							return v2Uri;
						}
						// If the v2 image can't be found, try v1
						lastRequestedUri = v1Uri;
						return axios.head(v1Uri, {
							timeout: 10000, // 10 seconds
							validateStatus: function (status) {
								return status >= 200 && status < 600;
							},
							lookup: dnsLookup,
						}).then(secondResponse => {
							// Cool, we've got an image from v1
							if (secondResponse.status <= 400) {
								cmsVersionUsed = 'v1';
								return v1Uri;
							}
							if (!request.params.originalImageUrl) {
								// If the v1 image can't be found, we error
								const error = httpError(404, `Unable to get image ${cmsId} from Content API v1 or v2`);
								error.cacheMaxAge = '1y';
								error.skipSentry = true;
								throw error;
							}
							return axios.head(request.params.originalImageUrl, {
								timeout: 10000, // 10 seconds
								validateStatus: function (status) {
									return status >= 200 && status < 600;
								},
								lookup: dnsLookup,
							}).then(thirdResponse => {
								// Cool, we've got an image from the original image url, which means the image has not yet been published to the Content API.
								// This usually means the image is being used in an unpublished entry in the Spark CMS.
								if (thirdResponse.status <= 400) {
									cmsVersionUsed = 'n/a';
									return request.params.originalImageUrl;
								}
								// If the v1 image can't be found, we error
								const error = httpError(404, `Unable to get image ${cmsId} from Content API v1 or v2`);
								error.cacheMaxAge = '1y';
								error.skipSentry = true;
								throw error;
							});
						});
					});
			})
			.then(resolvedUrl => {
				log.info(`ftcms-check cmsId=${cmsId} cmsVersionUsed=${cmsVersionUsed} source=${request.query.source}`);
				request.params.imageUrl = resolvedUrl;
				cache[cmsId] = resolvedUrl;
				next();
			})
			.catch(error => {
				log.info(`ftcms-check cmsId=${cmsId} cmsVersionUsed=error source=${request.query.source}`);
				if (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo') {
					error = new Error(`DNS lookup failed for "${lastRequestedUri}"`);
					error.skipSentry = true;
				}
				if (error.code === 'ECONNRESET') {
					const resetError = error;
					error = new Error(`Connection reset when requesting "${lastRequestedUri}" (${resetError.syscall})`);
					error.skipSentry = true;
				}
				// ETIMEDOUT is when no bytes are received at all
				// in the given timeout
				if (error.code === 'ETIMEDOUT') {
					const timeoutError = error;
					error = new Error(`Request timed out when requesting "${lastRequestedUri}" (${timeoutError.syscall})`);
					error.skipSentry = true;
				}
				// ESOCKETTIMEOUT is when the request receives bytes
				// initially but then has a pause between bytes equal
				// to or greater than the given timeout
				if (error.code === 'ESOCKETTIMEOUT') {
					const timeoutError = error;
					error = new Error(`Request socket timed out when requesting "${lastRequestedUri}" (${timeoutError.syscall})`);
					error.skipSentry = true;
				}
				next(error);
			});
		}
	};
}
