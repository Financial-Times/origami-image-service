'use strict';

const httpError = require('http-errors');
const requestPromise = require('../request-promise');

module.exports = getCmsUrl;

function getCmsUrl() {
	return (request, response, next) => {

		if (!request.params.imageUrl.startsWith('ftcms')) {
			return next();
		}

		// Grab the CMS ID and construct the v1 and v2 API URLs
		let uriParts = request.params.imageUrl.split(':').pop().split('?');
		const cmsId = uriParts.shift();
		const query = (uriParts.length ? '?' + uriParts.join('?') : '');
		const v1Uri = `http://im.ft-static.com/content/images/${cmsId}.img${query}`;
		const v2Uri = `http://prod-upp-image-read.ft.com/${cmsId}${query}`;

		// Keep track of which API we last checked
		let lastRequestedUri = v2Uri;

		// First try fetching the v2 image
		requestPromise({
			uri: v2Uri,
			method: 'HEAD'
		})
			.then(firstResponse => {
				// Cool, we've got an image from v2
				if (firstResponse.statusCode <= 400) {
					return v2Uri;
				}
				// If the v2 image can't be found, try v1
				lastRequestedUri = v1Uri;
				return requestPromise({
					uri: v1Uri,
					method: 'HEAD'
				}).then(secondResponse => {
					// Cool, we've got an image from v1
					if (secondResponse.statusCode <= 400) {
						return v1Uri;
					}
					// If the v1 image can't be found, we error
					const error = httpError(404, `Unable to get image ${cmsId} from FT CMS v1 or v2`);
					error.cacheMaxAge = '30s';
					throw error;
				});
			})
			.then(resolvedUrl => {
				request.params.imageUrl = resolvedUrl;
				next();
			})
			.catch(error => {
				if (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo') {
					error = new Error(`DNS lookup failed for "${lastRequestedUri}"`);
				}
				if (error.code === 'ECONNRESET') {
					const resetError = error;
					error = new Error(`Connection reset when requesting "${lastRequestedUri}" (${resetError.syscall})`);
				}
				next(error);
			});
	};
}
