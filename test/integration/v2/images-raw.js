'use strict';

const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itDoesNotRespondWithHeader = require('../helpers/it-does-not-respond-with-header');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	ftcms: 'ftcms:6c5a2f8c-18ca-4afa-80ff-7d56e41172b1',
	fthead: 'fthead:martin-wolf',
	fticon: 'fticon:cross',
	ftlogo: 'ftlogo:brand-ft',
	ftpodcast: 'ftpodcast:arts',
	ftsocial: 'ftsocial:whatsapp',
	http: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	https: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	protocolRelative: '//im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
};

describe('GET /v2/images/raw…', function() {

	describe('/http://… (HTTP scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https://… (HTTPS scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.https}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http%3A%2F%2F… (HTTP scheme encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.http)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https%3A%2F%2F… (HTTPS scheme encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.https)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('///… (protocol-relative unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelative}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/2F%2F… (protocol-relative encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.protocolRelative)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (ftcms scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (ftcms scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/fticon:… (fticon scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/fticon:… (fticon scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/fthead:… (fthead scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/fthead:… (fthead scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/ftsocial:… (ftsocial scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/ftpodcast:… (ftpodcast scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/ftlogo:… (ftlogo scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('without a `source` query parameter', function() {

		setupRequest('GET', `/v2/images/raw/${testImageUris.http}`);
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');

		it('responds with a descriptive error message', function(done) {
			this.request.expect(/the source parameter is required/i).end(done);
		});

	});

	describe('when a transform query parameter is invalid', function() {

		setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=test&bgcolor=f0`);
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');

		it('responds with a descriptive error message', function(done) {
			this.request.expect(/image bgcolor must be a valid hex code or color name/i).end(done);
		});

	});

	describe('when a dpr is set', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test&dpr=2`);
		itRespondsWithHeader('content-Dpr', '2');
	});

	describe('when a dpr is not set', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
		itDoesNotRespondWithHeader('content-Dpr');
	});

});
