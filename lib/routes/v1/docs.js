

module.exports = app => {

	// v1 endpoint redirect
	app.use('/__origami/service/image/v1', (request, response) => {
		response.redirect(301, `/__origami/service/image/v2${request.url}`);
	});

};
