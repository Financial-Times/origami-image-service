'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	valid: 'https://origami-images.ft.com/ftlogo/v1/origami-a601a979aef6e38299dc22501508ee0f490dfd330586fe124ba475a1757c4232b9238ed2bace3da92c83785e535e5c71ba1bebe1498b844b327d2fd62984d782.svg',
	notFound: 'http://google.com/404',
	nonSvg: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
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
