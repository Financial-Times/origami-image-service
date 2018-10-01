'use strict';

const purgeUrl = require('../../middleware/purge-url');
const purgeKey = require('../../middleware/purge-key');
const apiKey = require('../../middleware/api-key');
const noCache = require('../../middleware/no-cache');

module.exports = app => {
	const options = app.ft.options;

	if (options.fastlyApiKey && options.apiKey) {

		// Purge a specific URL
		// /v2/purge/url/?url=
		app.get(
			'/v2/purge/url',
			noCache(),
			apiKey(options),
			purgeUrl(options)
		);

		// Purge a specific key
		// /v2/purge/key/?key=
		app.get(
			'/v2/purge/key',
			noCache(),
			apiKey(options),
			purgeKey(options)
		);

	}
};
