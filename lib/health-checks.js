'use strict';

const cloudinary = require('cloudinary');
const HealthCheck = require('@financial-times/health-check');

module.exports = healthChecks;

function healthChecks(options) {

	// Configure Cloudinary
	cloudinary.config({
		cloud_name: options.cloudinaryAccountName
	});

	// Create and return the health check
	return new HealthCheck({
		checks: [

			// This check ensures that Cloudinary image
			// transforms are still working. It will fail
			// on a non-200 response
			{
				type: 'ping-url',
				url: () => {
					// Cache-bust this URL every 5 minutes
					const cacheBustInterval = (5 * 60 * 1000);
					const cacheBust = new Date(Math.floor(Date.now() / cacheBustInterval) * cacheBustInterval).toISOString();
					return cloudinary.url(`${options.customSchemeStore}/1x1.gif?cachebust=${cacheBust}`, {type: 'fetch'});
				},
				interval: 60000,
				id: 'cloudinary-image-transform',
				name: 'Images can be transformed with Cloudinary',
				severity: 2,
				businessImpact: 'Users may not be able to view images if they\'re not pre-cached',
				technicalSummary: 'Transforms an image with Cloudinary and checks that it responds successfully',
				panicGuide: 'Check the cloudinary status page https://status.cloudinary.com/'
			},

			// This check ensures that the custom scheme
			// store is available. It will fail on a non-200
			// response
			{
				type: 'ping-url',
				url: () => {
					const customSchemeBaseUrl = options.customSchemeStore.replace(/\/+$/, '');
					return `${customSchemeBaseUrl}/fticon/v1/cross.svg`;
				},
				interval: 30000,
				id: 'custom-scheme-store',
				name: 'Image sets can be retrieved from the custom scheme store',
				severity: 2,
				businessImpact: 'Users may not be able to use custom schemes (e.g. fticon) if they\'re not pre-cached',
				technicalSummary: 'Hits the given url and checks that it responds successfully',
				panicGuide: `Check that ${options.customSchemeStore}/__gtg is responding with a 200 status and that the AWS Region is up`
			},

			// This check ensures that UPP images are available.
			// It will fail on a non-200 response
			{
				type: 'ping-url',
				url: 'http://prod-upp-image-read.ft.com/__gtg',
				interval: 60000,
				id: 'upp-images',
				name: 'Images can be retrieved from the Universal Publishing Platform',
				severity: 2,
				businessImpact: 'Users may not be able to view images served by Universal Publishing Platform',
				technicalSummary: 'Hits the given url and checks that it responds successfully',
				panicGuide: `Check that the UPP endpoint http://prod-upp-image-read.ft.com/__gtg is responding with a 200 status and that the AWS Region is up`
			},

			// This check monitors the process memory usage
			// It will fail if usage is above the threshold
			{
				type: 'memory',
				threshold: 75,
				interval: 15000,
				id: 'system-memory',
				name: 'System memory usage is below 75%',
				severity: 1,
				businessImpact: 'Application may not be able to serve all image requests',
				technicalSummary: 'Process has run out of available memory',
				panicGuide: 'Restart the service dynos on Heroku'
			},

			// This check monitors the system CPU usage
			// It will fail if usage is above the threshold
			{
				type: 'cpu',
				threshold: 125,
				interval: 15000,
				id: 'system-load',
				name: 'System CPU usage is below 125%',
				severity: 1,
				businessImpact: 'Application may not be able to serve all image requests',
				technicalSummary: 'Process is hitting the CPU harder than expected',
				panicGuide: 'Restart the service dynos on Heroku'
			}

		],
		log: options.log
	});
}
