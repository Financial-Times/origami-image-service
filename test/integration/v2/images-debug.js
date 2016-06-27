'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	http: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
};

describe('GET /v2/images/debug…', function() {

	setupRequest('GET', `/v2/images/debug/${testImageUris.http}?source=test&width=123&height=456&echo`);
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with JSON representing the transforms in the image request', function(done) {
		this.request.expect({
			transform: {
				fit: 'cover',
				format: 'jpg',
				height: 456,
				quality: 70,
				uri: testImageUris.http,
				width: 123
			},
			appliedTransform: 'http://res.cloudinary.com/financial-times/image/fetch/c_fill,f_jpg,h_456,q_70,w_123/http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
		}).end(done);
	});

});
