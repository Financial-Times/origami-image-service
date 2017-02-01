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
		customSchemeStore: 'http://origami-imageset-uploader-s3.s3.amazonaws.com',
		defaultLayout: 'main',
		environment: 'test',
		log: mockLog,
		port: null,
		requestLogFormat: null
	})
	.listen()
	.then(app => {
		this.agent = supertest.agent(app);
		this.app = app;
	});
});

after(function() {
	this.app.origami.server.close();
});
