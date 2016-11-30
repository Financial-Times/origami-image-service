'use strict';
module.exports = (app, router) => {

	// Service home page
	router.get('/', (request, response) => {
		response.redirect(301, '/v2/');
	});

};
