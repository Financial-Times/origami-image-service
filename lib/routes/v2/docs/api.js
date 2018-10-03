'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

module.exports = app => {

	// v2 api documentation page
	app.get('/v2/docs/api', cacheControl({maxAge: '7d'}), (request, response) => {
		navigation.items.map(item => item.current = false);
		navigation.items[2].current = true;
		response.render('api', {
			title: 'API Reference - Origami Image Service',
			navigation
		});
	});

};
