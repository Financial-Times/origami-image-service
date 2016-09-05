'use strict';

module.exports = app => {

	app.get('/__gtg', (request, response) => {
		response.status(200).send('OK');
	});

};
