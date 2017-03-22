'use strict';

const cloudinary = require('cloudinary');
const pingInterval = 5 * 60 * 1000; // 5 minutes

module.exports = class CloudinaryMetrics {

	constructor(app) {
		this.log = app.origami.log;
		this.metrics = app.origami.metrics;
		this.options = app.origami.options;

		cloudinary.config({
			cloud_name: this.options.cloudinaryAccountName,
			api_key: this.options.cloudinaryApiKey,
			api_secret: this.options.cloudinaryApiSecret
		});

		this.pingUsage();
		setInterval(this.pingUsage.bind(this), pingInterval);
	}

	pingUsage() {
		// We need to catch because Cloudinary will throw
		// instead of rejecting if an API key isn't supplied
		try {
			return cloudinary.api.usage()
				.then(result => {
					this.metrics.count('cloudinary.transformations.usage', result.transformations.usage);
					this.metrics.count('cloudinary.transformations.limit', result.transformations.limit);
					this.metrics.count('cloudinary.objects.usage', result.objects.usage);
					this.metrics.count('cloudinary.objects.limit', result.objects.limit);
					this.metrics.count('cloudinary.bandwidth.usage', result.bandwidth.usage);
					this.metrics.count('cloudinary.bandwidth.limit', result.bandwidth.limit);
					this.metrics.count('cloudinary.storage.usage', result.storage.usage);
					this.metrics.count('cloudinary.storage.limit', result.storage.limit);
				})
				.catch(error => {
					this.log.error(`Cloudinary Metrics Failure (usage): ${error.message}`);
				});
		} catch (error) {
			this.log.error(`Cloudinary Metrics Failure (usage): ${error.message}`);
		}
	}

};
