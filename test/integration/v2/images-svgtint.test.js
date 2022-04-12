'use strict';

const assert = require('proclaim');
const axios = require('../helpers/axios');

const testImageUris = {
	valid: `${(process.env.CUSTOM_SCHEME_STORE || process.env.HOST || 'https://origami-image-service-dev.herokuapp.com')}/v2/images/raw/ftsocial-v1%3Atwitter%3Fsource%3Dorigami-image-service`,
	notFound: 'http://google.com/404',
	nonSvg: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
};

describe('GET /__origami/service/image/v2/images/svgtint…', function() {

	describe('with a valid URI', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/svgtint/${testImageUris.valid}`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('with a URI that 404s', function() {
		it('responds with a 404 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/svgtint/${testImageUris.notFound}`);
			assert.equal(response.status, 404);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('with a URI that does not point to an SVG', function() {
		it('responds with a descriptive error message', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/svgtint/${testImageUris.nonSvg}`);
			assert.equal(response.status, 400);
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
			assert.match(response.data, /uri must point to an svg image/i);
		});
	});

	describe('with a valid `color` query parameter', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/svgtint/${testImageUris.valid}?color=f00`);
			assert.equal(response.status, 200);
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('with an invalid `color` query parameter', function() {
		it('responds with a descriptive error message', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/svgtint/${testImageUris.valid}?color=nope`);
			assert.equal(response.status, 400);
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
			assert.match(response.data, /tint color must be a valid hex code/i);
		});
	});

});
