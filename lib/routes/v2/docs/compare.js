'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const images = require('../../../../data/comparison-images.json');

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
	app.get('/v2/docs/compare', cacheControl({maxAge: '7d'}), (request, response) => {
		response.render('compare', {
			title: 'Version Comparison - Origami Image Service',
			images: comparisonImages
		});
	});

};
