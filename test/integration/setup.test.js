'use strict';

const imageService = require('../..');
const supertest = require('supertest');

const HOST = process.env.HOST;

const noop = () => {};
const mockLog = {
	info: noop,
	error: noop,
	warn: noop
};

before(function() {
	// If HOST is defined, we are wanting to test a real server and not the local express app in this project.
	if (HOST) {
		return new Promise(resolve => {
			this.app = HOST;
			this.basepath = new URL(HOST).pathname;
			this.agent = supertest.agent(this.app);
			resolve();
		});
	} else {
		return imageService({
			contentApiKey: process.env.CONTENT_API_KEY,
			cloudinaryAccountName: 'financial-times', // TODO set up a test account for this?
			cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
			cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
			customSchemeCacheBust: process.env.CUSTOM_SCHEME_CACHE_BUST || '',
			customSchemeStore: process.env.CUSTOM_SCHEME_STORE || process.env.HOST,
			hostname: 'origami-image-service-qa.herokuapp.com',
			defaultLayout: 'main',
			environment: 'test',
			log: mockLog,
			port: 0,
			requestLogFormat: null
		})
		.listen()
		.then(app => {
			this.agent = supertest.agent(app);
			this.app = app;
		});
	}
});

after(function() {
	// If HOST is not defined, we are testing the local express app in this project and need to stop the server to let the process exit.
	if (!HOST) {
		this.app.ft.server.close();
	}
});