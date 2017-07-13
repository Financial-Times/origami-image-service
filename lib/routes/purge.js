'use strict';

const purgeUrls = require('@financial-times/origami-service').middleware.purgeUrls;

module.exports = app => {

	// Paths to purge
	const paths = [
		'/__about.json',
		'/main.css',
		'/main.js',
		'/v1',
		'/v1/',
		'/v2',
		'/v2/',
		'/v2/docs/api',
		'/v2/docs/api/',
		'/v2/docs/migration',
		'/v2/docs/migration/',
		'/v2/docs/url-builder',
		'/v2/docs/url-builder/'
	];

	// Purge page
	app.post('/purge', purgeUrls({
		urls: paths.map(path => `https://www.ft.com/__origami/service/image${path}`)
	}));

};
