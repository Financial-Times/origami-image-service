'use strict';

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

	// Debug image with an HTTP or HTTPS scheme, matches:
	// /v2/images/debug/https://...
	// /v2/images/debug/http://...
	router.get(
		/\/v2\/images\/debug\/(https?(:|%3A).*)$/i,
		processImageRequest(app.imageServiceConfig),
		debug
	);

	// Debug image with a custom scheme, matches:
	// /v2/images/debug/fticon:...
	// /v2/images/debug/fthead:...
	// /v2/images/debug/ftsocial:...
	// /v2/images/debug/ftpodcast:...
	// /v2/images/debug/ftlogo:...
	// TODO make sure these default to the original exension! E.g. SVG for fticon
	router.get(
		/^\/v2\/images\/debug\/((fticon|fthead|ftsocial|ftpodcast|ftlogo)(\-v\d+)?(:|%3A).*)$/i,
		mapCustomScheme(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		debug
	);

	// Image with a custom scheme, matches:
	// /v2/images/debug/ftcms:...
	router.get(
		/^\/v2\/images\/debug\/((ftcms)(:|%3A).*)$/i,
		getCmsUrl(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		debug
	);

};
