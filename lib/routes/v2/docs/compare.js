'use strict';

const images = require('../../../../data/comparison-images.json');
const oneWeek = 60 * 60 * 24 * 7;

module.exports = app => {

	// Prepare images
	const comparisonImages = images.map(image => {
		if (!image.isSection) {
			const uri = encodeURIComponent(image.uri);
			image.v1Url = `https://image.webservices.ft.com/v1/images/raw/${uri}?source=comparison&${image.transform}`;
			image.v2Url = `v2/images/raw/${uri}?source=comparison&${image.transform}`;
		}
		return image;
	});

	// v2 image comparison page
	app.get('/v2/docs/compare', (request, response) => {
		response.set({
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.render('compare', {
			layout: 'main',
			title: 'Version Comparison - Origami Image Service',
			images: comparisonImages
		});
	});

};
