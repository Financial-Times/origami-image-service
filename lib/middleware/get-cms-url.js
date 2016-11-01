'use strict';

const httpError = require('http-errors');

module.exports = getCmsUrl;

function getCmsUrl() {
	return (request, response, next) => {

		// Grab the CMS ID and construct the v1 and v2 API URLs
		let uriParts = request.params[0].split(':').pop().split('?');
		const cmsId = uriParts.shift();
		const query = (uriParts.length ? '?' + uriParts.join('?') : '');
		const v1Uri = `http://im.ft-static.com/content/images/${cmsId}.img${query}`;
		const v2Uri = `http://com.ft.imagepublish.prod.s3.amazonaws.com/${cmsId}${query}`;

		// Use HEAD requests so we don't have to wait for
		// the full image to load
		const fetchOptions = {
			method: 'HEAD'
		};

		// First try fetching the v1 image
		fetch(v1Uri, fetchOptions)
			.then(firstResponse => {
				// Cool, we've got an image from v1
				if (firstResponse.ok) {
					return firstResponse;
				}
				// If the v1 image can't be found, try v2
				return fetch(v2Uri, fetchOptions);
			})
			.then(secondResponse => {
				// Cool, we've got an image from v2 (or v1 if that is OK)
				if (secondResponse.ok) {
					return secondResponse;
				}
				// If the v2 image can't be found, we error
				throw httpError(404, `Unable to get image ${cmsId} from FT CMS v1 or v2`);
			})
			.then(finalResponse => {
				request.params[0] = finalResponse.url;
				next();
			})
			.catch(next);
	};
}
