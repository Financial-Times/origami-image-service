'use strict';

const purgeUrl = require('../../middleware/purge-url');
const purgeKey = require('../../middleware/purge-key');
const apiKey = require('../../middleware/api-key');

module.exports = app => {
	const options = app.origami.options;

	if (options.fastlyApiKey && options.apiKey) {

		// Purge a specific URL
		// /v2/purge/url/?url=
		app.get(
			'/v2/purge/url',
			apiKey(options),
			purgeUrl(options)
		);

		// Purge a specific key
		// /v2/purge/key/?key=
		app.get(
			'/v2/purge/key',
			apiKey(options),
			purgeKey(options)
		);

	}
};
