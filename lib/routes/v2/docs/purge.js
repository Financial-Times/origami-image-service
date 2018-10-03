'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

module.exports = app => {
	// v2 purge page
	app.get('/v2/docs/purge', cacheControl({ maxAge: '1y' }), (request, response) => {
		navigation.items.map(item => item.current = false);
		navigation.items[4].current = true;
		response.render('purge', {
			title: 'Purging Guide - Origami Image Service',
			navigation
		});
	});
};
