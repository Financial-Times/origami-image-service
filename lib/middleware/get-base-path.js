'use strict';

module.exports = getBasePath;

function getBasePath(request, response, next) {
	let basePath = request.headers['x-service-base-path'] || '/';
	if (!basePath.startsWith('/')) {
		basePath = `/${basePath}`;
	}
	if (!basePath.endsWith('/')) {
		basePath = `${basePath}/`;
	}
	request.basePath = response.locals.basePath = basePath;
	next();
}
