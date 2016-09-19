'use strict';

const images = require('../../../../data/comparison-images.json');
const oneWeek = 60 * 60 * 24 * 7;

module.exports = app => {

	// v2 image comparison page
	app.get('/v2/docs/compare', (request, response) => {
		response.set({
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.render('compare', {
			layout: 'main',
			title: 'Version Comparison - Origami Image Service',
			images: images
		});
	});

};
