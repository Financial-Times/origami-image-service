'use strict';

const cloudinary = require('cloudinary');
const requestPromise = require('./request-promise');
const pingInterval = 60 * 1000;

module.exports = class HealthChecks {

	constructor(options) {
		this.options = options;
		this.log = this.options.log;

		cloudinary.config({
			cloud_name: options.cloudinaryAccountName
		});

		const customSchemeCheckBaseUrl = options.customSchemeStore.replace(/\/+$/, '');
		this.customSchemeCheckUrl = `${customSchemeCheckBaseUrl}/fticon/v1/cross.svg`;

		this.uppImagesUrl = 'http://prod-upp-image-read.ft.com/__gtg';

		this.statuses = {
			customSchemeStore: {
				id: 'custom-scheme-store',
				name: 'Image sets can be retrieved from the custom scheme store',
				ok: true,
				severity: 2,
				businessImpact: 'Users may not be able to use custom schemes (e.g. fticon) if they\'re not pre-cached',
				technicalSummary: 'Hits the given url and checks that it responds successfully',
				panicGuide: `Check that the bucket ${this.customSchemeCheckUrl} still exists and that the AWS Region is up`
			},
			cloudinary: {
				id: 'cloudinary-image-transform',
				name: 'Images can be transformed with Cloudinary',
				ok: true,
				severity: 2,
				businessImpact: 'Users may not be able to view images if they\'re not pre-cached',
				technicalSummary: 'Transforms an image with Cloudinary and checks that it responds successfully',
				panicGuide: 'Check the cloudinary status page https://status.cloudinary.com/'
			},
			uppImages: {
				id: 'upp-images',
				name: 'Images can be retrieved from the Universal Publishing Platform',
				ok: true,
				severity: 2,
				businessImpact: 'Users may not be able to view images served by Universal Publishing Platform',
				technicalSummary: 'Hits the given url and checks that it responds successfully',
				panicGuide: `Check that the UPP endpoint ${this.uppImagesUrl} still exists and that the AWS Region is up`
			}
		};

		this.retrieveData();
		setInterval(this.retrieveData.bind(this), pingInterval);
	}

	retrieveData() {
		const interval = (5 * 60 * 1000);
		const date = new Date(Math.floor(Date.now() / interval) * interval);
		const cloudinaryCheckUrl = `https://www.ft.com/__origami/service/imageset-data/1x1.gif?cachebust=${date.toISOString()}`;
		this.pingService('cloudinary', cloudinary.url(cloudinaryCheckUrl, {type: 'fetch'}));
		this.pingService('customSchemeStore', this.customSchemeCheckUrl);
		this.pingService('uppImages', this.uppImagesUrl);
	}

	pingService(name, url) {
		if (!!this.options.testHealthcheckFailure) {
			return this.statuses[name].ok = false;
		}
		return requestPromise({
			uri: url,
			method: 'HEAD'
		})
		.then(response => {
			if (response.statusCode >= 400) {
				this.statuses[name].ok = false;
				this.log.error(`Healthcheck Failure (${name}): pinging "${url}" responded with ${response.statusCode}`);
			} else {
				this.statuses[name].ok = true;
			}
		})
		.catch(error => {
			this.statuses[name].ok = false;
			this.log.error(`Healthcheck Failure (${name}): pinging "${url}" errored: ${error.message}`);
		});
	}

	getFunction() {
		return () => {
			return this.getPromise();
		};
	}

	getGoodToGoFunction() {
		return () => {
			return this.getGoodToGoPromise();
		};
	}

	getPromise() {
		return Promise.resolve(this.getStatusArray());
	}

	getGoodToGoPromise() {
		return Promise.resolve(this.getStatusArray().every(status => status.ok));
	}

	getStatusArray() {
		return Object.keys(this.statuses).map(key => this.statuses[key]);
	}

};
