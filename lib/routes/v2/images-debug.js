'use strict';

const convertToCmsScheme = require('../../middleware/convert-to-cms-scheme');
const getCmsUrl = require('../../middleware/get-cms-url');
const mapCustomScheme = require('../../middleware/map-custom-scheme');
const processImageRequest = require('../../middleware/process-image-request');

module.exports = (app, router) => {

	// Debug middleware to log transform information
	function debug(request, response) {
		response.send({
			transform: request.transform,
			appliedTransform: request.appliedTransform
		});
	}

	// Debug image with a custom scheme, matches:
	// /v2/images/debug/fticon:...
	// /v2/images/debug/fthead:...
	// /v2/images/debug/ftsocial:...
	// /v2/images/debug/ftpodcast:...
	// /v2/images/debug/ftlogo:...
	router.get(
		/^\/v2\/images\/debug\/((fticon|fthead|ftsocial|ftpodcast|ftlogo)(\-v\d+)?(:|%3A).*)$/i,
		mapCustomScheme(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		debug
	);

	// Debug image with an HTTP or HTTPS scheme that should be an ftcms URL, matches:
	// /v2/images/debug/https://com.ft.imagepublish.prod.s3.amazonaws.com/...
	// /v2/images/debug/http://com.ft.imagepublish.prod.s3.amazonaws.com/...
	// /v2/images/debug/https://im.ft-static.com/...
	// /v2/images/debug/http://im.ft-static.com/...
	router.get(
		/^\/v2\/images\/debug\/(https?(:|%3A)(\/|%2F){2}(prod-upp-image-read\.ft\.com|com\.ft\.imagepublish|im\.ft-static\.com).+)$/i,
		convertToCmsScheme(),
		getCmsUrl(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		debug
	);

	// Debug image with a custom scheme, matches:
	// /v2/images/debug/ftcms:...
	router.get(
		/^\/v2\/images\/debug\/((ftcms)(:|%3A).*)$/i,
		getCmsUrl(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		debug
	);

	// Debug image with an HTTP or HTTPS scheme, matches:
	// /v2/images/debug/https://...
	// /v2/images/debug/http://...
	router.get(
		/\/v2\/images\/debug\/(https?(:|%3A).*)$/i,
		processImageRequest(app.imageServiceConfig),
		debug
	);

};
