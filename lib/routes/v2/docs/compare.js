'use strict';

const httpError = require('http-errors');

module.exports = app => {
	app.get('/v2/docs/compare', (request, response, next) => {
		next(httpError(410, 'The comparison page is no longer available, as Image Service V1 has been decommissioned.'));
	});
};
