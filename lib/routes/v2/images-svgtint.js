

const handleSvg = require('../../middleware/handle-svg');

module.exports = app => {
	const options = app.ft.options;
	// Image with an HTTP or HTTPS scheme, matches:
	// /v2/images/svgtint/https://...
	// /v2/images/svgtint/http://...
	app.get(/\/__origami\/service\/image\/v2\/images\/svgtint\/(https?(:|%3A).*)$/, handleSvg(options));

};
