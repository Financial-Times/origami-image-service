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
		cloudinaryAccountName: 'financial-times', // TODO set up a test account for this?
		customSchemeStore: 'http://example.com/images',
		environment: 'test',
		log: mockLog,
		logLevel: process.env.LOG_LEVEL || 'trace',
		port: process.env.PORT || null,
		basePath: ''
	})
	.then(service => {
		this.agent = supertest.agent(service);
		this.service = service;
	});
});

after(function() {
	this.service.server.close();
});
