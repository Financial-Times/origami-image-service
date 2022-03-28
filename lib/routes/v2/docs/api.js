'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

module.exports = app => {

	// v2 api documentation page
	app.get([
		'/v2/docs/api',
		'/__origami/service/image/v2/docs/api',
	 ], cacheControl({maxAge: '7d'}), (request, response) => {
		for (const item of navigation.items) {
			if (item.href === request.path) {
				item.current = true;
			} else {
				item.current = false;
			}
		}
		response.render('api', {
			title: 'API Reference - Origami Image Service',
			navigation
		});
	});

};
