'use strict';

module.exports = app => {

	// v1 endpoint redirect
	app.use('/v1', (request, response) => {
		response.redirect(301, `/v2${request.url}`);
	});

};
