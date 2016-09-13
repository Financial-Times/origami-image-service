'use strict';

const statuses = require('statuses');

module.exports = createErrorHandler;

function createErrorHandler(config) {
	// TODO comment on Express function entropy
	return function handleErrors(error, request, response, next) {
		/* eslint no-unused-vars:0 */
		error = sanitizeError(error);
		const explanation = explanations[error.status] || '';

		response.status(error.status).render('error', {
			layout: 'layout',
			title: `Error ${error.status}`,
			message: error.message,
			explanation: explanation
		});

		if (error.status >= 500) {
			config.log.error(error.message);
		}
	};
}

function sanitizeError(error) {
	switch (error.code) {
		case 'ENOTFOUND':
			error.status = 502;
			error.message = statuses[error.status];
			break;
	}
	error.status = error.status || 500;
	return error;
}

const explanations = {
	400: 'There\'s an issue with your request that is caused by a malformed URL or HTTP headers.',
	404: 'The page you\'re looking for could not be found.',
	410: 'The page you\'re looking for is no longer available.',
	501: 'We currently don\'t implement the endpoint you\'re looking for. This will be available at a later date.',
	500: 'An error occurred on the server while processing your request. We\'ll look into this.',
	502: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.'
};
