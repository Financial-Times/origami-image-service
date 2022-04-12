'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');
const path = require('path');

module.exports = app => {

	// v2 api documentation page
	app.get('/__origami/service/image/v2/docs/api', cacheControl({maxAge: '7d'}), (request, response) => {
		for (const item of navigation.items) {
			if (item.href === request.path || item.href === path.join('/__origami/service/image', request.path)) {
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
