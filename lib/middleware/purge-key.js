'use strict';

const FastlyPurge = require('fastly-purge');
const httpError = require('http-errors');

module.exports = function (config) {
	const FASTLY_API_KEY = config.fastlyApiKey;
	const FASTLY_SERVICE_ID = config.fastlyServiceId;

	const fastly = new FastlyPurge(FASTLY_API_KEY, {
		softPurge: true
	});

	return function purgeKeyMiddleware(request, response, next) {

		if (!request.query.key) {
			return next(httpError(400, 'Please add the key you want to purge as the value to the query parameter `key`. E.G. `/purge/key?key=`'));
		}

		const key = request.query.key;
		return fastly.key(FASTLY_SERVICE_ID, key, {
			apiKey: FASTLY_API_KEY
		}, error => {
			if (error) {
				next(httpError(500, error));
			} else {
				response.status(200).send(`Purged ${key}`);
			}
		});
	};
};