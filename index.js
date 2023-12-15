'use strict';

require('dotenv').config();

const imageService = require('./lib/image-service');
const throng = require('throng');
const {createClient} = require('redis');

const options = {
	contentApiKey: process.env.CONTENT_API_KEY,
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

async function startWorker(id) {
	console.log(`Started worker ${id}`);
	try {
		let redisDb;
		const redisConfig = {
			url: process.env.REDIS_URL,
			socket: {
				tls: true,
				rejectUnauthorized: false
			}
		};

		// FOR CI we don't set the REGION env variable and to test integration tests we don't want to have tls enabled
		if (!process.env.REGION) {
			delete redisConfig.socket;
		}

		if (process.env.REGION === 'LOCAL') {
			redisDb = await createClient();
		} else {
			redisDb = await createClient(redisConfig);
		}
		
		redisDb.on('error', err => console.log('Redis Client Error', err)).connect();
		
		options.redisClient = redisDb;
	} catch (err) {
		console.log('Redis Client Error', err);
	}
	
	imageService(options).listen().catch(() => {
		process.exit(1);
	});
}
