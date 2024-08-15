

const assert = require('proclaim');
const axios = require('../helpers/axios');
const testImageUris = require('../helpers/test-image-uris');

describe('GET /__origami/service/image/v2/images/metadata…', function() {
	it('responds with JSON representing the metadata of the requested image', async function() {
		const response = await axios.get(`/__origami/service/image/v2/images/metadata/${testImageUris.httpsftcms}?source=origami-image-service&width=123&height=456&echo`);
		assert.equal(response.status, 200);
		assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');

		assert.equal(response.headers['surrogate-key'], 'origami-image-service');
		assert.equal(response.headers['timing-allow-origin'], '*');
		assert.equal(response.headers['ft-suppress-friendly-error'], 'true');

		assert.isObject(response.data);
		assert.strictEqual(response.data.dpr, 1);
		assert.strictEqual(response.data.type, 'image/jpeg');
		assert.strictEqual(response.data.width, 123);
		assert.strictEqual(response.data.height, 456);
		assert.greaterThan(response.data.filesize, 5000);
		assert.lessThan(response.data.filesize, 12000);
	});

});
