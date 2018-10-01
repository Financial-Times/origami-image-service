'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	const options = app.ft.options;

	if (options.fastlyApiKey && options.apiKey) {
		// v2 purge page
		app.get('/v2/docs/purge', cacheControl({ maxAge: '1y' }), (request, response) => {
			response.render('purge', {
				title: 'Purging Guide - Origami Image Service'
			});
		});
	}
};
