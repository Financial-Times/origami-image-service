'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// v2 api documentation page
	app.get('/v2/docs/api', cacheControl({maxAge: '7d'}), (request, response) => {
		response.render('api', {
			title: 'API Reference - Origami Image Service'
		});
	});

};
