'use strict';

const assert = require('proclaim');
const axios = require('../helpers/axios');

describe('GET /', function() {
	it('responds with a 301 status', async function() {
		const response = await axios.get('/');
		assert.equal(response.status, 301);
		assert.equal(response.headers['location'], '/__origami/service/image/v2/');
	});
});

describe('GET /__origami/service/image/v1/', function() {
	it('responds with a 301 status', async function() {
		const response = await axios.get('/__origami/service/image/v1/');
		assert.equal(response.status, 301);
		assert.equal(response.headers['location'], '/__origami/service/image/v2/');
	});
});

describe('GET /__origami/service/image/v1/images/raw/fticon:cross?source=origami-image-service', function() {
	it('responds with a 301 status', async function() {
		const response = await axios.get('/__origami/service/image/v1/images/raw/fticon:cross?source=origami-image-service');
		assert.equal(response.status, 301);
		assert.equal(response.headers['location'], '/__origami/service/image/v2/images/raw/fticon:cross?source=origami-image-service');
	});
});
