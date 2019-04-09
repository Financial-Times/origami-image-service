'use strict';

module.exports = setupRequest;

function setupRequest(method, endpoint, headers) {
	method = method.toLowerCase();
	beforeEach(function() {
		this.timeout(30000);
		this.request = this.agent[method](endpoint);
		if (headers) {
			Object.keys(headers).forEach(header => {
				this.request.set(header, headers[header]);
			});
		}
	});
}
