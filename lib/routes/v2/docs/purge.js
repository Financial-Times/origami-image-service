

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');
const path = require('path');

module.exports = app => {
	// v2 purge page
	app.get('/__origami/service/image/v2/docs/purge', cacheControl({ maxAge: '1y' }), (request, response) => {
		for (const item of navigation.items) {
			if (item.href === request.path || item.href === path.join('/__origami/service/image', request.path)) {
				item.current = true;
			} else {
				item.current = false;
			}
		}
		response.render('purge', {
			title: 'Purging Guide - Origami Image Service',
			navigation
		});
	});
};
