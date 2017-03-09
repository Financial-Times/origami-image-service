'use strict';

module.exports = app => {

	// v1 endpoint redirect
	app.use('/v1', (request, response) => {
		const url = `https://image.webservices.ft.com/v1${request.url}`;
		response.redirect(301, url);
	});

};
