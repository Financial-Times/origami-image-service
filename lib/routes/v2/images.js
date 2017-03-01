'use strict';

const convertToCmsScheme = require('../../middleware/convert-to-cms-scheme');
const createResponseInterceptor = require('../../response-interceptor');
const getCmsUrl = require('../../middleware/get-cms-url');
const getImageMeta = require('../../middleware/get-image-meta');
const mapCustomScheme = require('../../middleware/map-custom-scheme');
const oneWeek = 60 * 60 * 24 * 7;
const processImageRequest = require('../../middleware/process-image-request');
const sourceParam = require('@financial-times/source-param-middleware');

module.exports = app => {

	const requireValidSourceParam = sourceParam({
		verifyUsingCmdb: false
	});

	// Map param numbers to named params
	function mapParams(request, response, next) {
		request.params.imageMode = request.params[0];
		request.params.imageUrl = request.params[1];
		next();
	}

	function mapScheme(request, response, next) {
		request.params.scheme = request.params[2] || 'http'; // We make protocol-relative links use http.
		next();
	}

	// Handle an image request
	function handleImage(request, response, next) {
		switch (request.params.imageMode) {
			case 'raw':
				proxyImage(request, response, next);
				break;
			case 'debug':
				debug(request, response, next);
				break;
			case 'metadata':
				getImageMeta(request, response, next);
				break;
			default:
				next();
				break;
		}
	}

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

	// Debug middleware to log transform information
	function debug(request, response) {
		response.set({
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.send({
			transform: request.transform,
			appliedTransform: request.appliedTransform
		});
	}

	// Image with a custom scheme, matches:
	// /v2/images/raw/fticon:...
	// /v2/images/raw/fthead:...
	// /v2/images/debug/ftlogo:...
	app.get(
		/^\/v2\/images\/(raw|debug|metadata)\/((fticon|fthead|ftsocial|ftpodcast|ftlogo|ftbrand|specialisttitle)(\-v\d+)?(:|%3A).*)$/i,
		mapParams,
		mapScheme,
		mapCustomScheme(app.origami.options),
		requireValidSourceParam,
		processImageRequest(app.origami.options),
		handleImage
	);

	// Image with an HTTP or HTTPS scheme that should be an ftcms URL, matches:
	// /v2/images/raw/https://com.ft.imagepublish.prod.s3.amazonaws.com/...
	// /v2/images/raw/https://im.ft-static.com/...
	// /v2/images/debug/http://im.ft-static.com/...
	app.get(
		/^\/v2\/images\/(raw|debug|metadata)\/((https?(:|%3A))?(\/|%2F)*(prod-upp-image-read\.ft\.com|com\.ft\.imagepublish|im\.ft-static\.com).+)$/i,
		mapParams,
		mapScheme,
		convertToCmsScheme(),
		getCmsUrl(app.origami.options),
		requireValidSourceParam,
		processImageRequest(app.origami.options),
		handleImage
	);

	// Image with a custom scheme, matches:
	// /v2/images/raw/ftcms:...
	// /v2/images/debug/ftcms:...
	app.get(
		/^\/v2\/images\/(raw|debug|metadata)\/((ftcms)(:|%3A).*)$/i,
		mapParams,
		mapScheme,
		getCmsUrl(app.origami.options),
		requireValidSourceParam,
		processImageRequest(app.origami.options),
		handleImage
	);

	// Image with an HTTP or HTTPS scheme, matches:
	// /v2/images/raw/https://...
	// /v2/images/raw/http://...
	// /v2/images/debug/http://...
	app.get(
		/^\/v2\/images\/(raw|debug|metadata)\/((https?(:|%3A))?(\/|%2F)*.*)$/i,
		mapParams,
		mapScheme,
		requireValidSourceParam,
		processImageRequest(app.origami.options),
		handleImage
	);

};
