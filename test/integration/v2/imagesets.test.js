'use strict';

const assert = require('proclaim');
const axios = require('../helpers/axios');

const {
	ftbrand,
	ftflag,
	fticon,
	fticonV1,
	ftlogo,
	specialisttitle,
	ftpodcast,
	ftsocial,
	ftsocialV2,
} = require('../../../lib/imagesets');

const usingExternalServer = Boolean(process.env.HOST);

const onlyRunOnExternalServer = usingExternalServer ? describe : describe.skip;

// These tests are not possible to run against a local server as the images need to be accessible to Cloudinary over the web
onlyRunOnExternalServer('Origami Image Sets via Custom Schemes', function () {
	describe('ftbrand', function () {
		for (const name of Object.keys(ftbrand)) {
			describe(`ftbrand:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftbrand:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
			describe(`ftbrand-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftbrand-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});
	describe('ftflag', function () {
		for (const name of Object.keys(ftflag)) {
			describe(`ftflag:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftflag:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
			describe(`ftflag-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftflag-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});
	describe('fticon', function () {
		for (const name of Object.keys(fticon)) {
			describe(`fticon:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/fticon:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
		for (const name of Object.keys(fticonV1)) {
			describe(`fticon-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/fticon-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});
	describe('ftlogo', function () {
		for (const name of Object.keys(ftlogo)) {
			describe(`ftlogo:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftlogo:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
			describe(`ftlogo-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftlogo-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});
	describe('ftpodcast', function () {
		for (const name of Object.keys(ftpodcast)) {
			describe(`ftpodcast:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftpodcast:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
			describe(`ftpodcast-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftpodcast-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});
	describe('ftsocial', function () {
		for (const name of Object.keys(ftsocial)) {
			describe(`ftsocial:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftsocial:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
			describe(`ftsocial-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftsocial-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
		for (const name of Object.keys(ftsocialV2)) {
			describe(`ftsocial-v2:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/ftsocial-v2:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});
	describe('specialisttitle', function () {
		for (const name of Object.keys(specialisttitle)) {
			describe(`specialisttitle:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/specialisttitle:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
			describe(`specialisttitle-v1:${name}`, function () {
				it('responds with a 200 status', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/specialisttitle-v1:${name}?source=origami-image-service`);
					assert.equal(response.status, 200);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
					assert.match(response.headers['content-type'], /image\/[a-z]+/);
				});
			});
		}
	});

});
