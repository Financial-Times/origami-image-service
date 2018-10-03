'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('GET /v2/', function() {

	setupRequest('GET', '/v2/');
	itRespondsWithStatus(200);
	itRespondsWithContentType('text/html');

	it('has a <base> element with the expected path', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
		}).end(done);
	});

});

describe('GET /v2/ with an FT-Origami-Service-Base-Path header', function() {

	setupRequest('GET', '/v2/', {
		'FT-Origami-Service-Base-Path': '/foo/bar/'
	});
	itRespondsWithStatus(200);
	itRespondsWithContentType('text/html');

	it('has a <base> element with the expected path', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
		}).end(done);
	});

});
