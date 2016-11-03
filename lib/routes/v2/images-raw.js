'use strict';

const convertToCmsScheme = require('../../middleware/convert-to-cms-scheme');
const createResponseInterceptor = require('../../response-interceptor');
const getCmsUrl = require('../../middleware/get-cms-url');
const httpError = require('http-errors');
const mapCustomScheme = require('../../middleware/map-custom-scheme');
const processImageRequest = require('../../middleware/process-image-request');

module.exports = (app, router) => {

	// Proxy image middleware
	function proxyImage(request, response, next) {

		// We have to intercept the response so that we can
		// turn Cloudinary errors into useful HTML error
		// pages – normally they are returned as GIFs. So if
		// the response contains a cloudinary error, we call
		// `next` with it so that the default error handling
		// middleware can take over
		createResponseInterceptor(response, {
			condition: () => {
				return !!response.cloudinaryError;
			},
			end: () => {
				next(response.cloudinaryError);
			}
		});

		// Proxy to Cloudinary
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
		/^\/v2\/images\/raw\/((fticon|fthead|ftsocial|ftpodcast|ftlogo)(\-v\d+)?(:|%3A).*)$/i,
		mapCustomScheme(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with an HTTP or HTTPS scheme that should be an ftcms URL, matches:
	// /v2/images/raw/https://com.ft.imagepublish.prod.s3.amazonaws.com/...
	// /v2/images/raw/http://com.ft.imagepublish.prod.s3.amazonaws.com/...
	// /v2/images/raw/https://im.ft-static.com/...
	// /v2/images/raw/http://im.ft-static.com/...
	router.get(
		/^\/v2\/images\/raw\/(https?(:|%3A)(\/|%2F){2}(prod-upp-image-read\.ft\.com|com\.ft\.imagepublish|im\.ft-static\.com).+)$/i,
		convertToCmsScheme(),
		getCmsUrl(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with a custom scheme, matches:
	// /v2/images/raw/ftcms:...
	router.get(
		/^\/v2\/images\/raw\/((ftcms)(:|%3A).*)$/i,
		getCmsUrl(app.imageServiceConfig),
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with an HTTP or HTTPS scheme, matches:
	// /v2/images/raw/https://...
	// /v2/images/raw/http://...
	router.get(
		/\/v2\/images\/raw\/(https?(:|%3A).*)$/i,
		processImageRequest(app.imageServiceConfig),
		proxyImage
	);

	// Image with an imageset, matches:
	// all other /v2/images/raw/...
	router.get(/\/v2\/images\/raw\/?$/i, (request, response, next) => {
		// Not implemented, maybe we don't need to based on logs?
		next(httpError(501));
	});

};
