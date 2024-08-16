

// NOTE: this is copied largely from Commandeer, and is
// definitely a candidate for splitting into a new open
// source project. See here for the original source:
// https://github.com/rowanmanning/commandeer/blob/master/test/unit/lib/response-interceptor.js

const noop = () => {};

module.exports = createResponseInterceptor;

function createResponseInterceptor(response, options) {
	const originals = backUpResponseMethods(response);
	['writeHead', 'write', 'end'].forEach(methodName => {
		response[methodName] = function() {
			if (methodName === 'end') {
				restoreResponseMethods(response, originals);
			}
			if (options.condition()) {
				return (options[methodName] || noop).apply(response, arguments);
			}
			originals[methodName].apply(response, arguments);
		};
	});
}

function backUpResponseMethods(response) {
	return {
		end: response.end,
		write: response.write,
		writeHead: response.writeHead
	};
}

function restoreResponseMethods(response, originals) {
	response.end = originals.end;
	response.write = originals.write;
	response.writeHead = originals.writeHead;
}
