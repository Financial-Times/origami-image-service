#!/usr/bin/env node
'use strict';

const comparisonImagesPath = `${__dirname}/../data/comparison-images.json`;
const comparisonImages = require(comparisonImagesPath);
const fs = require('fs');
require('isomorphic-fetch');

fetchImages(comparisonImages).then(results => {
	console.log(`Saving image info to "${comparisonImagesPath}"`);
	fs.writeFileSync(comparisonImagesPath, JSON.stringify(results, null, '\t'));
});

function fetchImages(images) {
	return Promise.all(images.map(fetchImage));
}

function fetchImage(image) {
	if (image.isSection) {
		return image;
	}
	return fetch(getImageUrl(image)).then(response => {
		console.log(`Loaded image "${response.url}"`);
		image.v1ImageFormat = response.headers.get('Content-Type');
		image.v1ImageSize = response.headers.get('Content-Length');
		return image;
	});
}

function getImageUrl(image) {
	const uri = encodeURIComponent(image.uri);
	return `https://image.webservices.ft.com/v1/images/raw/${uri}?source=comparison&${image.transform}`;
}
