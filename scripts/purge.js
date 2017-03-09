#!/usr/bin/env node

'use strict';

require('dotenv').config({
	silent: true
});

const FASTLY_API_KEY = process.env.FASTLY_API_KEY;

if (!FASTLY_API_KEY) {
	console.error('In order to purge assets from Fastly, you need to have set the environment variable "FASTLY_API_KEY". This can be done by creating a file named ".env" in the root of this repository with the contents "FASTLY_API_KEY=XXXXXX", where XXXXXX is your Fastly API key.');
	process.exit(1);
}

const denodeify = require('denodeify');

const fastlySoftPurge = new (require('fastly-purge'))(FASTLY_API_KEY, { softPurge: true });
const purgeUrl = denodeify(fastlySoftPurge.url.bind(fastlySoftPurge));

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
	'/v2/docs/compare',
	'/v2/docs/compare/',
	'/v2/docs/migration',
	'/v2/docs/migration/',
	'/v2/docs/url-builder',
	'/v2/docs/url-builder/'
];

const endpoints = paths.map(path => 'https://www.ft.com/__origami/service/image' + path);

Promise.all(endpoints.map(endpoint => purgeUrl(endpoint, {
	apiKey: FASTLY_API_KEY
})))
.then(() => console.log('\nPurged all endpoints successfully.'))
.catch((e) => console.error(`Failed to purge endpoints. ${e}`));
