'use strict';

const CloudinaryMetrics = require('./cloudinary-metrics');
const healthChecks = require('./health-checks');
const httpError = require('http-errors');
const httpProxy = require('http-proxy');
const oneWeek = 60 * 60 * 24 * 7;
const oneYear = oneWeek * 52;
const origamiService = require('@financial-times/origami-service');
const requireAll = require('require-all');
const url = require('url');
const base64 = require('base-64');
const utf8 = require('utf8');

module.exports = imageService;

function imageService(options) {

	const health = healthChecks(options);
	options.healthCheck = health.checks();
	options.goodToGoTest = health.gtg();
	options.about = require('../about.json');

	const app = origamiService(options);
	app.proxy = createProxy(origamiService.middleware.errorHandler());

	app.use(origamiService.middleware.getBasePath());
	mountRoutes(app);
	app.use(origamiService.middleware.notFound());
	app.use(origamiService.middleware.errorHandler());

	new CloudinaryMetrics(app);

	return app;
}

function createProxy(errorHandler) {
	const proxy = httpProxy.createProxyServer({
		ignorePath: true,
		proxyTimeout: 25000, // 25 seconds
		secure: false
	});
	proxy.on('proxyReq', proxyRequestHandler);
	proxy.on('proxyRes', proxyResponseHandler);
	proxy.on('error', (error, request, response) => {
		if (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo') {
			error = new Error(`Proxy DNS lookup failed for "${request.url}"`);
		}
		if (error.code === 'ECONNRESET') {
			const resetError = error;
			// Possible timeout because of this:
			// https://github.com/nodejitsu/node-http-proxy/issues/718
			resetError.syscall = resetError.syscall || 'possible timeout';
			error = new Error(`Proxy connection reset when requesting "${request.url}" (${resetError.syscall})`);
		}
		if (error.code === 'ETIMEDOUT') {
			const timeoutError = error;
			error = new Error(`Proxy request timed out when requesting "${request.url}" (${timeoutError.syscall})`);
		}
		errorHandler(error, request, response);
	});

	const requestHeaderWhitelist = [
		'accept',
		'accept-encoding',
		'accept-language',
		'if-none-match'
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
		proxyRequest.setHeader('User-Agent', 'FT-Origami-Image-Service/2 (https://github.com/Financial-Times/origami-image-service)');
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

		// If we have a 40x/50x response at this point, Cloudinary
		// is so broken that it can't even send its own X-CLD-Error
		// header. We need to handle this to prevent these errors
		// from being cached
		if (proxyResponse.statusCode >= 400) {
			proxyResponse.headers = {};
			response.cloudinaryError = httpError(proxyResponse.statusCode);
			return;
		}

		// If we have a 30x response at this point, something has
		// gone pretty wrong with Cloudinary's fetch API – it should
		// never redirect
		if (proxyResponse.statusCode >= 300 && proxyResponse.statusCode !== 304 ) {
			proxyResponse.headers = {};
			response.cloudinaryError = httpError(500);
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

		switch (request.params.scheme) {
			case 'ftbrand':
			case 'ftcms':
			case 'fthead':
			case 'fticon':
			case 'ftlogo':
			case 'ftpodcast':
			case 'ftsocial':
			case 'specialisttitle':
				proxyResponse.headers['Surrogate-Control'] = `max-age=${oneYear}, stale-while-revalidate=${oneYear}, stale-if-error=${oneYear}`;
				break;
			default:
				proxyResponse.headers['Surrogate-Control'] = proxyResponse.headers['Cache-Control'];
				break;
		}

		const keyForAllImages = 'origami-image-service';
		const keyForImageType = proxyResponse.headers['Content-Type'];
		const keyForScheme = request.params.scheme;

		const normaliseKeys = (key = '') => key.toLowerCase();
		const encodeKeys = (key = '') => base64.encode(utf8.encode(key));

		proxyResponse.headers['Surrogate-Key'] = `${keyForAllImages} ${encodeKeys(normaliseKeys(keyForImageType))} ${encodeKeys(normaliseKeys(keyForScheme))} ${encodeKeys(request.params.schemeUrl)}`;

		if (request.transform && request.transform.getDpr()) {
			proxyResponse.headers['Content-Dpr'] = request.transform.getDpr();
		}

		proxyResponse.headers['Vary'] = 'FT-image-format, Content-Dpr';
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
