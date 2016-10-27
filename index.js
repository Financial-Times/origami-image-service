'use strict';

require('dotenv').load({
	silent: false
});

const throng = require('throng');

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  start: (id) => {
		console.log(`Started worker ${ id }`);

		const config = require('./config');
		const imageService = require('./lib/image-service');

		imageService(config).catch(error => {
			config.error(error.stack);
			process.exit(1);
		});
	}
});
