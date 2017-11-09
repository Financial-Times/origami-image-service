'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	http: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
};

describe('GET /v2/images/metadata…', function() {

	setupRequest('GET', `/v2/images/metadata/${testImageUris.http}?source=test&width=123&height=456&echo`);
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with JSON representing the metadata of the requested image', function(done) {
		this.request.expect(response => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.dpr, 1);
			assert.strictEqual(response.body.type, 'image/jpeg');
			assert.strictEqual(response.body.width, 123);
			assert.strictEqual(response.body.height, 456);
			assert.greaterThan(response.body.filesize, 5000);
			assert.lessThan(response.body.filesize, 12000);
		}).end(done);
	});

});
