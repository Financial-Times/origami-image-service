'use strict';

const statuses = require('statuses');

module.exports = createErrorHandler;

function createErrorHandler(config) {
	// TODO comment on Express function entropy
	return function handleErrors(error, request, response, next) {
		/* eslint no-unused-vars:0 */
		error = sanitizeError(error);
		const explanation = explanations[error.status] || '';
		let stack = '';

		if (config.environment !== 'production') {
			stack = `
				<h2>Error stack</h2>
				<p>You're seeing this because the environment is set to "${config.environment}".</p>
				<pre>${error.stack}</pre>
			`;
		}

		response.status(error.status).send(`
			<h1>Error ${error.status}: ${error.message}</h1>
			${explanation}
			${stack}
		`);

		if (error.status >= 500) {
			config.log.error(error.stack); // TODO use proper logging
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
	404: '<p>The page you\'re looking for could not be found.</p>',
	410: '<p>The page you\'re looking for is no longer available.</p>',
	501: '<p>We currently don\'t implement the endpoint you\'re looking for. This will be available at a later date.</p>',
	500: '<p>An error occurred on the server while processing your request. We\'ll look into this.</p>',
	502: '<p>The server was acting as a gateway or proxy and received an invalid response from the upstream server.</p>'
};
