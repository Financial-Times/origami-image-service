'use strict';

const dotenv = require('dotenv');
const imageService = require('./lib/image-service');
const throng = require('throng');

dotenv.load({
	silent: true
});
const options = {
	cloudinaryAccountName: process.env.CLOUDINARY_ACCOUNT_NAME,
	cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
	cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
	customSchemeCacheBust: process.env.CUSTOM_SCHEME_CACHE_BUST || '',
	customSchemeStore: process.env.CUSTOM_SCHEME_STORE,
	defaultLayout: 'main',
	hostname: process.env.HOSTNAME,
	log: console,
	metricsAppName: 'origami-image-service',
	name: 'Origami Image Service',
	port: process.env.PORT || 8080,
	testHealthcheckFailure: process.env.TEST_HEALTHCHECK_FAILURE || false,
	workers: process.env.WEB_CONCURRENCY || 1,
	apiKey: process.env.API_KEY,
	fastlyApiKey: process.env.FASTLY_API_KEY,
	fastlyServiceId: process.env.FASTLY_SERVICE_ID
};

throng({
	workers: options.workers,
	start: startWorker
});

function startWorker(id) {
	console.log(`Started worker ${id}`);
	imageService(options).listen().catch(() => {
		process.exit(1);
	});
}
