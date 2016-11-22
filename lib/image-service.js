'use strict';

const express = require('@financial-times/n-express');
const handleErrors = require('./middleware/handle-errors');
const healthChecks = require('./health-checks');
const httpProxy = require('http-proxy');
const morgan = require('morgan');
const notFound = require('./middleware/not-found');
const oneWeek = 60 * 60 * 24 * 7;
const path = require('path');
const requireAll = require('require-all');
const url = require('url');

module.exports = imageService;

function imageService(config) {

	const app = createExpressApp(config);
	const errorHandler = handleErrors(config);
	app.proxy = createProxy(errorHandler);

	config.basePath = config.basePath || '';
	app.locals.basePath = config.basePath;
	app.imageServiceConfig = config;

	healthChecks.init(config);

	if (!config.suppressLogs) {
		app.use(morgan('combined'));
	}
	mountRoutes(app);
	app.use(notFound);
	app.use(errorHandler);

	return app.listen(config.port).then(server => {
		app.server = server;
		return app;
	});
}

function createExpressApp(config) {
	const app = express({
		healthChecks: [
			healthChecks.cloudinary,
			healthChecks.customSchemeStore
		],
		healthChecksAppName: `Origami Image Service in ${process.env.REGION || 'unknown region'}`,
		systemCode: config.systemCode,
		withHandlebars: true,
		withAssets: false,
		withServiceMetrics: false,
		layoutsDir: path.resolve(__dirname, '../views/layouts'),
		partialsDir: [path.resolve(__dirname, '../views')]
	});
	app.enable('case sensitive routing');
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
		'accept-language',
		'user-agent'
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

		if (request.transform && request.transform.getDpr()) {
			proxyResponse.headers['Content-Dpr'] = request.transform.getDpr();
		}

		proxyResponse.headers['Vary'] = 'FT-image-format, Content-Dpr';

	}

	return proxy;
}

function mountRoutes(app) {
	const router = express.Router(); // eslint-disable-line new-cap
	app.get('/', (request, response) => {
		response.redirect(app.imageServiceConfig.basePath);
	});
	app.get('/__gtg', (request, response) => {
		response.status(200).send('OK');
	});
	app.use(app.imageServiceConfig.basePath, express.static('public'));
	app.use(app.imageServiceConfig.basePath, router);
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app, router)
	});
}
