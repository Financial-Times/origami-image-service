'use strict';

module.exports = (app, router) => {

	// v1 endpoint redirect
	router.use('/v1', (request, response) => {
		const url = `https://image.webservices.ft.com/v1${request.url}`;
		response.redirect(301, url);
	});

};
