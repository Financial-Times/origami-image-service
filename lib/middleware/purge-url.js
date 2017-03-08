'use strict';

const FastlyPurge = require('fastly-purge');
const httpError = require('http-errors');

module.exports = function (config) {
	const FASTLY_API_KEY = config.fastlyApiKey;

	const fastly = new FastlyPurge(FASTLY_API_KEY, {
		softPurge: true
	});

	return function purgeUrlMiddleware(request, response, next) {
		if (!request.query.url) {
			return next(httpError(400, 'Please url-encode the url you want to purge and add it as the value to the query parameter `url`. E.G. `/purge/url?url=`'));
		}

		const url = decodeURIComponent(request.query.url);

		return fastly.url(url, {
			apiKey: FASTLY_API_KEY
		}, error => {
			if (error) {
				next(httpError(500, error));
			} else {
				response.status(200).send(`Purged ${url}`);
			}
		});
	};
};