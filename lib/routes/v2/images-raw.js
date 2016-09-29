'use strict';

const getCmsUrl = require('../../middleware/get-cms-url');
const httpError = require('http-errors');
const mapCustomScheme = require('../../middleware/map-custom-scheme');
const processImageRequest = require('../../middleware/process-image-request');

module.exports = (app, router) => {

	// Proxy image middleware
	function proxyImage(request, response) {
		app.proxy.web(request, response, {
			target: request.appliedTransform
		});
	}

	// Image with a custom scheme, matches:
	// /v2/images/raw/fticon:...
	// /v2/images/raw/fthead:...
	// /v2/images/raw/ftsocial:...
	// /v2/images/raw/ftpodcast:...
	// /v2/images/raw/ftlogo:...
	router.get(
		/^\/v2\/images\/raw\/((fticon|fthead|ftsocial|ftpodcast|ftlogo)(\-v\d+)?(:|%3A).*)$/,
		mapCustomScheme(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with a custom scheme, matches:
	// /v2/images/raw/ftcms:...
	router.get(
		/^\/v2\/images\/raw\/((ftcms)(:|%3A).*)$/,
		getCmsUrl(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with an HTTP or HTTPS scheme, matches:
	// /v2/images/raw/https://...
	// /v2/images/raw/http://...
	router.get(
		/\/v2\/images\/raw\/(https?(:|%3A).*)$/,
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with an imageset, matches:
	// all other /v2/images/raw/...
	router.get(/\/v2\/images\/raw\/?$/, (request, response, next) => {
		// Not implemented, maybe we don't need to based on logs?
		next(httpError(501));
	});

};
