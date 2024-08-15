

const assert = require('proclaim');
const axios = require('./helpers/axios');

describe('GET /404', function() {
	it('responds with a 404 status', async function() {
		const response = await axios.get('/404');
		assert.equal(response.status, 404);
		assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
	});
});
