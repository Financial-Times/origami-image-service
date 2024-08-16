

const assert = require('proclaim');
const axios = require('../helpers/axios');

describe('Origami Image Sets JSON API', function () {
	describe('app-badge', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/app-badge?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('app-badge-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/app-badge-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftbrand', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftbrand?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftbrand-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftbrand-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftflag', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftflag?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftflag-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftflag-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('fticon', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/fticon?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('fticon-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/fticon-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftlogo', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftlogo?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftlogo-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftlogo-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftpodcast', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftpodcast?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftpodcast-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftpodcast-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftsocial', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftsocial?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftsocial-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftsocial-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('ftsocial-v2', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/ftsocial-v2?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('specialisttitle', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/specialisttitle?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
	describe('specialisttitle-v1', async function () {
		it('responds with a 200 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/imagesets/specialisttitle-v1?source=origami-image-service');
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});
});
