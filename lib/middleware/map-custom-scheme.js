'use strict';

const ImageTransform = require('../image-transform');

module.exports = mapCustomScheme;

function mapCustomScheme(config) {
	return (request, response, next) => {

		const originalUrl = request.params[0];
		let customSchemeUrl;

		// Replace any custom schemes in the request URI with
		// their HTTP/HTTPS equivalents.
		try {
			customSchemeUrl = ImageTransform.resolveCustomSchemeUri(originalUrl, config.customSchemeStore);
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
