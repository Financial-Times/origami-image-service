'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('GET /v2/', function() {

	setupRequest('GET', '/v2/');
	itRespondsWithStatus(200);
	itRespondsWithContentType('text/html');

	it('has a <base> element with the expected baseUrl', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			assert.match(response.text, /<base\s+href="\/"\s*\/>/);
		}).end(done);
	});

});
