'use strict';

const express = require('@financial-times/n-express');
const handleErrors = require('./middleware/handle-errors');
const httpProxy = require('http-proxy');
const morgan = require('morgan');
const notFound = require('./middleware/not-found');
const oneWeek = 60 * 60 * 24 * 7;
const pkg = require('../package.json');
const requireAll = require('require-all');
const url = require('url');

module.exports = imageService;

function imageService(config) {

	const app = createExpressApp(config);
	const errorHandler = handleErrors(config);
	app.proxy = createProxy(errorHandler);
	app.imageServiceConfig = config;

	app.use(morgan('combined'));
	mountRoutes(app);
	app.use(notFound);
	app.use(errorHandler);

	return app.listen(config.port).then(server => {
		app.server = server;
		return app;
	});
}

function createExpressApp() {
	const app = express();
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
		proxyRequest.setHeader('User-Agent', `${pkg.name}/${pkg.version}`);
	}

	// Handle proxy responses, allowing modification of a response
	// before sending it to the user
	function proxyResponseHandler(proxyResponse) {
		const originalHeaders = proxyResponse.headers;

		// Define our own headers for proxy responses
		proxyResponse.headers = {
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': `public, max-age=${oneWeek}, stale-while-revalidate=${oneWeek}, stale-if-error=${oneWeek}`,
			'Content-Encoding': originalHeaders['content-encoding'],
			'Content-Type': originalHeaders['content-type'],
			'Content-Length': originalHeaders['content-length'],
			'Connection': 'keep-alive',
			'Vary': originalHeaders['vary']
		};

	}

	return proxy;
}

function mountRoutes(app) {
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app)
	});
}
