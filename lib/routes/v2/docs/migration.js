'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

module.exports = app => {
	// v2 migration page
	app.get('/v2/docs/migration', cacheControl({maxAge: '7d'}), (request, response) => {
		navigation.items.map(item => item.current = false);
		navigation.items[3].current = true;
		
		response.render('migration', {
			title: 'Migration Guide - Origami Image Service',
			navigation
		});
	});
};
