'use strict';

const ImageTransform = require('../image-transform');
const ImgixClient = require('imgix-core-js');

module.exports = imgixTransform;

function imgixTransform(transform, options = {}) {
	if (!(transform instanceof ImageTransform)) {
		throw new Error('Invalid transform argument, expected an ImageTransform object');
	}
	const client = new ImgixClient({
		host: `${options.imgixSourceName}.imgix.net`,
		includeLibraryParam: false,
		secureURLToken: options.imgixSecureUrlToken
	});
	return client.buildURL(transform.getUri(), buildImgixTransforms(transform));
}

function buildImgixTransforms(transform) {
	const imgixTransforms = {
		fm: transform.getFormat(),
		quality: transform.getQuality(),
		fit: getImgixFitStrategy(transform.getFit())
	};
	if (transform.getWidth() !== undefined) {
		imgixTransforms.w = transform.getWidth();
	}
	if (transform.getHeight() !== undefined) {
		imgixTransforms.h = transform.getHeight();
	}
	if (transform.getDpr() !== undefined) {
		imgixTransforms.dpr = transform.getDpr();
	}
	if (transform.getBgcolor() !== undefined) {
		imgixTransforms.bg = transform.getBgcolor();
	}
	return imgixTransforms;
}

function getImgixFitStrategy(fitStrategy) {
	const fitStrategyMap = {
		contain: 'clip',
		cover: 'crop',
		'scale-down': 'max'
	};
	return fitStrategyMap[fitStrategy];
}
