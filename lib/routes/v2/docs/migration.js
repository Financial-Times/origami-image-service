'use strict';

const oneWeek = 60 * 60 * 24 * 7;

module.exports = app => {

	// v2 migration page
	app.get('/v2/docs/migration', (request, response) => {
		response.set({
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.render('migration', {
			layout: 'main',
			title: 'Migration Guide - Origami Image Service'
		});
	});

};
