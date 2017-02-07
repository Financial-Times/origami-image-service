'use strict';

const HealthChecks = require('./health-checks');
const httpProxy = require('http-proxy');
const oneWeek = 60 * 60 * 24 * 7;
const origamiService = require('@financial-times/origami-service');
const requireAll = require('require-all');
const url = require('url');

module.exports = imageService;

function imageService(options) {

	const healthChecks = new HealthChecks(options);
	options.healthCheck = healthChecks.getFunction();
	options.goodToGoTest = healthChecks.getGoodToGoFunction();
	options.about = require('../about.json');

	const app = origamiService(options);
	app.proxy = createProxy(origamiService.middleware.errorHandler());

	app.use(origamiService.middleware.getBasePath());
	mountRoutes(app);
	app.use(origamiService.middleware.notFound());
	app.use(origamiService.middleware.errorHandler());

	return app;
}

function createProxy(errorHandler) {
	const proxy = httpProxy.createProxyServer({
		ignorePath: true,
		secure: false
	});
	proxy.on('proxyReq', proxyRequestHandler);
	proxy.on('proxyRes', proxyResponseHandler);
	proxy.on('error', errorHandler);

	const requestHeaderWhitelist = [
		'accept',
		'accept-encoding',
		'accept-language'
	];

	// Handle proxy requests, allowing modification of a request
	// before it is proxied
	function proxyRequestHandler(proxyRequest, request, response, proxyOptions) {

		// Remove non-whitelisted headers from the proxy request
		Object.keys(request.headers)
			.filter(header => !requestHeaderWhitelist.includes(header))
			.forEach(header => proxyRequest.removeHeader(header));

		// Set our own headers to send to the third party
		proxyRequest.setHeader('Host', url.parse(proxyOptions.target).host);
		proxyRequest.setHeader('User-Agent', 'Origami Image Service (https://github.com/Financial-Times/origami-image-service)');
	}

	// Handle proxy responses, allowing modification of a response
	// before sending it to the user
	function proxyResponseHandler(proxyResponse, request, response) {
		const originalHeaders = proxyResponse.headers;

		// If we have a Cloudinary error, save it to the response
		// and don't assume the response is an image
		if (originalHeaders['x-cld-error']) {
			// We reset the response headers to remove the caching that
			// Cloudinary specifies, as well as getting rid of the
			// `image/gif` Content-Type
			proxyResponse.headers = {};
			response.cloudinaryError = new Error(originalHeaders['x-cld-error']);
			response.cloudinaryError.status = proxyResponse.statusCode;
			if (/^resource not found .* HTML response$/i.test(response.cloudinaryError.message)) {
				response.cloudinaryError.message = 'The requested resource is not an image';
				response.cloudinaryError.status = 400;
			}
			if (/^(error in loading .* 403 forbidden$|resource not found)/i.test(response.cloudinaryError.message)) {
				response.cloudinaryError.message = 'The requested image could not be found';
				response.cloudinaryError.status = 404;
			}
			return;
		}

		// Define our own headers for proxy responses
		proxyResponse.headers = {
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': `public, max-age=${oneWeek}, stale-while-revalidate=${oneWeek}, stale-if-error=${oneWeek}`,
			'Content-Encoding': originalHeaders['content-encoding'],
			'Content-Type': originalHeaders['content-type'],
			'Content-Length': originalHeaders['content-length'],
			'Connection': 'keep-alive',
			'Etag': originalHeaders['etag'],
			'Expires': new Date(Date.now() + (oneWeek * 1000)).toGMTString(),
			'Last-Modified': originalHeaders['last-modified']
		};

		if (request.headers['accept'] && request.headers['accept'].includes('image/webp')) {
			proxyResponse.headers['FT-Image-Format'] = 'webp';
		} else if (request.headers['accept'] && request.headers['accept'].includes('image/jxr')) {
			proxyResponse.headers['FT-Image-Format'] = 'jpegxr';
		} else {
			proxyResponse.headers['FT-Image-Format'] = 'default';
		}

		const keyForAllImages = 'origami-image-service';
		const keyForImageType = proxyResponse.headers['Content-Type'];
		const keyForScheme = request.params.scheme;

		proxyResponse.headers['Surrogate-Key'] = `${keyForAllImages} ${keyForImageType} ${keyForScheme}`;

		if (request.transform && request.transform.getDpr()) {
			proxyResponse.headers['Content-Dpr'] = request.transform.getDpr();
		}

		proxyResponse.headers['Vary'] = 'FT-image-format, Content-Dpr';

		// ==============================
		// Logging for debug

		const userAgent = JSON.stringify(request.headers['user-agent'] || null);
		const normalisedUserAgent = JSON.stringify(request.headers['ft-normalised-ua'] || null);
		const accept = JSON.stringify(request.headers['accept'] || null);
		const imageFormat = JSON.stringify(proxyResponse.headers['Content-Type'] || null);
		const ftImageFormat = JSON.stringify(proxyResponse.headers['FT-Image-Format'] || null);
		console.log(`IMAGE-PROXY-DEBUG: ua=${userAgent} nua=${normalisedUserAgent} accept=${accept} ftImageFormat=${ftImageFormat} imageFormat=${imageFormat}`);

		// ==============================

	}

	return proxy;
}

// NOTE: should this be in Origami Service?
function mountRoutes(app) {
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app)
	});
}
