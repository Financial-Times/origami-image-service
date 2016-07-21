'use strict';

module.exports = {
	cloudinaryAccountName: process.env.CLOUDINARY_ACCOUNT_NAME,
	customSchemeStore: process.env.CUSTOM_SCHEME_STORE,
	environment: process.env.NODE_ENV || 'development',
	imgixSecureUrlToken: process.env.IMGIX_SECURE_URL_TOKEN,
	imgixSourceName: process.env.IMGIX_SOURCE_NAME,
	log: console,
	logLevel: process.env.LOG_LEVEL || 'info',
	port: process.env.PORT || 8080
};
