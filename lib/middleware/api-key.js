'use strict';

const httpError = require('http-errors');

module.exports = function (config = {}) {
	const API_KEY = config.apiKey;

	return function apiKeyMiddleware(request, response, next) {
		const source = request.get('FT-Origami-Api-Key');

		// If don't have an API key set, skip API key validation
		if (!API_KEY) {
			return next(httpError(500, 'Application has no registered API keys.'));
		}

		if (API_KEY === source) {
			return next();
		} else {
			return next(httpError(401, 'FT-Origami-Api-Key header does not contain a valid api key.'));
		}
	};
};
