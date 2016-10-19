'use strict';

module.exports = {
	basePath: '/origami/service/image',
	cloudinaryAccountName: process.env.CLOUDINARY_ACCOUNT_NAME,
	customSchemeStore: process.env.CUSTOM_SCHEME_STORE,
	environment: process.env.NODE_ENV || 'development',
	hostname: process.env.HOSTNAME,
	log: console,
	logLevel: process.env.LOG_LEVEL || 'info',
	port: process.env.PORT || 8080
};
