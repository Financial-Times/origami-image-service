'use strict';

module.exports = app => {
	// Service home page
	app.get(['/', '/__origami/service/image/'], (request, response) => {
		response.redirect(301, '/__origami/service/image/v2/');
	});
};
