'use strict';

module.exports = app => {

	// Service home page
	app.get('/', (request, response) => {
		response.redirect(301, '/v2/');
	});

};
