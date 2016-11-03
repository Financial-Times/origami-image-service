'use strict';

const currentWeekNumber = require('current-week-number');
const ImageTransform = require('../image-transform');

module.exports = mapCustomScheme;

function mapCustomScheme(config) {
	return (request, response, next) => {

		const originalUrl = request.params[0];
		let customSchemeUrl;

		// Build a cache-busting string – the current ISO week
		const date = new Date();
		const cacheBust = `${date.getFullYear()}-W${currentWeekNumber(date)}-1`;

		// Replace any custom schemes in the request URI with
		// their HTTP/HTTPS equivalents.
		try {
			customSchemeUrl = ImageTransform.resolveCustomSchemeUri(originalUrl, config.customSchemeStore, cacheBust);
		} catch (error) {
			error.status = 400;
			return next(error);
		}

		// If the custom scheme URL has been set, make sure
		// we default the extension correctly
		if (customSchemeUrl !== originalUrl) {
			request.params[0] = customSchemeUrl;

			// If the custom scheme URL has been set, make sure
			// we default the format correctly
			if (!request.query.format) {
				const match = customSchemeUrl.match(/\.(png|svg)(\?.*)?$/);
				request.query.format = (match ? match[1] : undefined);
			}
		}

		next();
	};
}
