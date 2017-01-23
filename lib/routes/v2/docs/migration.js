'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// v2 migration page
	app.get('/v2/docs/migration', cacheControl({maxAge: '7d'}), (request, response) => {
		response.render('migration', {
			title: 'Migration Guide - Origami Image Service'
		});
	});

};
