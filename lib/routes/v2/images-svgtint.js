'use strict';

const tintSvg = require('../../middleware/tint-svg');

module.exports = app => {

	// Image with an HTTP or HTTPS scheme, matches:
	// /v2/images/svgtint/https://...
	// /v2/images/svgtint/http://...
	app.get(
		/\/v2\/images\/svgtint\/(https?(:|%3A).*)$/,
		tintSvg()
	);

};
