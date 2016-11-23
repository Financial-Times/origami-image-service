'use strict';

module.exports = {
	basePath: '/__origami/service/image',
	cloudinaryAccountName: process.env.CLOUDINARY_ACCOUNT_NAME,
	cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
	cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
	customSchemeStore: process.env.CUSTOM_SCHEME_STORE,
	customSchemeCacheBust: process.env.CUSTOM_SCHEME_CACHE_BUST || '',
	environment: process.env.NODE_ENV || 'development',
	hostname: process.env.HOSTNAME,
	systemCode: 'origami-image-service-v2',
	log: console,
	logLevel: process.env.LOG_LEVEL || 'info',
	port: process.env.PORT || 8080
};
