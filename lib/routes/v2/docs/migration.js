'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

module.exports = app => {
	// v2 migration page
	app.get('/v2/docs/migration', cacheControl({maxAge: '7d'}), (request, response) => {
		for (const item of navigation.items) {
			if (item.href === request.path) {
				item.current = true;
			} else {
				item.current = false;
			}
		}
		
		response.render('migration', {
			title: 'Migration Guide - Origami Image Service',
			navigation
		});
	});
};
