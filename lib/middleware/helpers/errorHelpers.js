const httpError = require('http-errors');
const createErrorFromAxiosError = require('../../create-error-from-axios-error');

/**
 * Handle errors that occur during download
 * Using the axios error object, create a new error object with the same properties
 * @param {Object} error
 * @param {String} uri
 */
function handleErrorDuringDownload(error, uri) {
	const newError = createErrorFromAxiosError(error, uri);
	throw newError;
}

/**
 * Create an error object with the given status and set cacheMaxAge
 * @param {String} status
 * @param {String} cacheMaxAge
 */
function handleHttpError(status, cacheMaxAge = '5m') {
	const error = httpError(status);
	error.cacheMaxAge = cacheMaxAge;
	throw error;
}

module.exports = {
	handleErrorDuringDownload,
	handleHttpError,
};
