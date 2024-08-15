

const assert = require('proclaim');
const axios = require('../helpers/axios');

describe('GET /__origami/service/image/v2/', function() {
	it('responds with a 200 status', async function() {
		const response = await axios.get('/__origami/service/image/v2/');
		assert.equal(response.status, 200);
		assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
	});
});
