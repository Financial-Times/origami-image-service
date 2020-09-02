'use strict';

const imageService = require('../..');
const supertest = require('supertest');

const noop = () => {};
const mockLog = {
	info: noop,
	error: noop,
	warn: noop
};

before(function() {
	return imageService({
		contentApiKey: process.env.CONTENT_API_KEY,
		cloudinaryAccountName: 'financial-times', // TODO set up a test account for this?
		cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
		cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
		customSchemeCacheBust: process.env.CUSTOM_SCHEME_CACHE_BUST || '',
		customSchemeStore: process.env.CUSTOM_SCHEME_STORE || 'https://origami-images.ft.com',
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
});

after(function() {
	this.app.ft.server.close();
});
