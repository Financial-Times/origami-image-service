'use strict';

const oneWeek = 60 * 60 * 24 * 7;

module.exports = app => {

	// v2 home page
	app.get('/v2', (request, response) => {
		response.set({
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.render('index', {
			layout: 'main',
			title: 'Origami Image Service'
		});
	});

};
