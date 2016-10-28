'use strict';

const cloudinary = require('cloudinary');
const pingInterval = 60 * 1000;

let customSchemeCheckUrl;
let cloudinaryCheckUrl;

// Health checks
const healthChecks = module.exports = {

	// Service status store
	statuses: {},

	// Initialise the health-checks
	init(config) {

		cloudinary.config({
			cloud_name: config.cloudinaryAccountName
		});
		customSchemeCheckUrl = (config.customSchemeStore || '').replace(/\/+$/, '') + '/fticon/v1/cross.svg';
		cloudinaryCheckUrl = cloudinary.url('http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img', {
			type: 'fetch'
		});

		// Ping services that the image service relies on
		function pingServices() {
			healthChecks.pingService('cloudinary', cloudinaryCheckUrl);
			healthChecks.pingService('customSchemeStore', customSchemeCheckUrl);
		}

		pingServices();
		setInterval(pingServices, pingInterval);
	},

	// Ping a service and record its status
	pingService(name, url) {
		return fetch(url)
			.then(response => {
				healthChecks.statuses[name] = response.ok;
			})
			.catch(() => {
				healthChecks.statuses[name] = false;
			});
	},

	// Check that the Cloudinary is available
	cloudinary: {
		getStatus: () => ({
			id: 'cloudinary-image-transform',
			name: 'Images can be transformed with Cloudinary',
			ok: healthChecks.statuses.cloudinary,
			severity: 2,
			businessImpact: 'Users may not be able to view images if they\'re not pre-cached',
			technicalSummary: 'Transforms an image with Cloudinary and checks that it responds successfully',
			panicGuide: 'Check the cloudinary status page http://status.cloudinary.com/'
		})
	},

	// Check that the custom scheme store (S3 bucket) is available
	customSchemeStore: {
		getStatus: () => ({
			id: 'custom-scheme-store',
			name: 'Image sets can be retrieved from the custom scheme store',
			ok: healthChecks.statuses.customSchemeStore,
			severity: 2,
			businessImpact: 'Users may not be able to use custom schemes (e.g. fticon) if they\'re not pre-cached',
			technicalSummary: 'Hits the given url and checks that it responds successfully',
			panicGuide: 'Check that the bucket still exists and that the AWS Region is up'
		})
	}
};
