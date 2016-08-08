'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	valid: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg',
	notFound: 'http://google.com/404',
	nonSvg: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
};

describe('GET /v2/images/svgtint…', function() {

	describe('with a valid URI', function() {
		setupRequest('GET', `/v2/images/svgtint/${testImageUris.valid}`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('with a URI that 404s', function() {
		setupRequest('GET', `/v2/images/svgtint/${testImageUris.notFound}`);
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('with a URI that does not point to an SVG', function() {
		setupRequest('GET', `/v2/images/svgtint/${testImageUris.nonSvg}`);
		itRespondsWithStatus(400);
		it('responds with a descriptive error message', function(done) {
			this.request.expect(/uri must point to an svg image/i).end(done);
		});
	});

	describe('with a valid `color` query parameter', function() {
		setupRequest('GET', `/v2/images/svgtint/${testImageUris.valid}?color=f00`);
		itRespondsWithStatus(200);
	});

	describe('with an invalid `color` query parameter', function() {
		setupRequest('GET', `/v2/images/svgtint/${testImageUris.valid}?color=nope`);
		itRespondsWithStatus(400);
		it('responds with a descriptive error message', function(done) {
			this.request.expect(/tint color must be a valid hex code/i).end(done);
		});
	});

});
