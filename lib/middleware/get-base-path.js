'use strict';

module.exports = getBasePath;

function getBasePath(request, response, next) {
	let basePath = request.headers['x-service-base-path'] || '/';
	if (basePath.substr(0, 1) !== '/') {
		basePath = `/${basePath}`;
	}
	if (basePath.substr(-1, 1) !== '/') {
		basePath = `${basePath}/`;
	}
	request.basePath = response.locals.basePath = basePath;
	next();
}
