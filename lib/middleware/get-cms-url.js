'use strict';

const httpError = require('http-errors');
const requestPromise = require('../request-promise');

module.exports = getCmsUrl;

function getCmsUrl() {
	return (request, response, next) => {

		// Grab the CMS ID and construct the v1 and v2 API URLs
		let uriParts = request.params[0].split(':').pop().split('?');
		const cmsId = uriParts.shift();
		const query = (uriParts.length ? '?' + uriParts.join('?') : '');
		const v1Uri = `http://im.ft-static.com/content/images/${cmsId}.img${query}`;
		const v2Uri = `http://com.ft.imagepublish.prod.s3.amazonaws.com/${cmsId}${query}`;

		// First try fetching the v1 image
		requestPromise({
			uri: v1Uri,
			method: 'HEAD'
		})
			.then(firstResponse => {
				// Cool, we've got an image from v1
				if (firstResponse.statusCode <= 400) {
					return v1Uri;
				}
				// If the v1 image can't be found, try v2
				return requestPromise({
					uri: v2Uri,
					method: 'HEAD'
				});
			})
			.then(secondResponse => {
				// We have a valid v1 URI, pass it on
				if (typeof secondResponse === 'string') {
					return secondResponse;
				}
				// Cool, we've got an image from v2
				if (secondResponse.statusCode <= 400) {
					return v2Uri;
				}
				// If the v2 image can't be found, we error
				throw httpError(404, `Unable to get image ${cmsId} from FT CMS v1 or v2`);
			})
			.then(resolvedUrl => {
				request.params[0] = resolvedUrl;
				next();
			})
			.catch(next);
	};
}
