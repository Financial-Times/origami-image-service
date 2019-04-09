'use strict';

module.exports = itRespondsWithStatus;

function itRespondsWithStatus(status) {
	it(`responds with a ${status} status`, function(done) {
		this.timeout(30000);
		this.request.expect(status).end(done);
	});
}
