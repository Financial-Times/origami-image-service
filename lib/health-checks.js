'use strict';

const cloudinary = require('cloudinary');
const requestPromise = require('./request-promise');
const pingInterval = 60 * 1000;

module.exports = class HealthChecks {

	constructor(options) {
		this.options = options;

		cloudinary.config({
			cloud_name: options.cloudinaryAccountName
		});
		this.cloudinaryCheckUrl = cloudinary.url('https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img', {
			type: 'fetch'
		});

		const customSchemeCheckBaseUrl = options.customSchemeStore.replace(/\/+$/, '');
		this.customSchemeCheckUrl = `${customSchemeCheckBaseUrl}/fticon/v1/cross.svg`;

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
			}
		};

		this.retrieveData();
		setInterval(this.retrieveData.bind(this), pingInterval);
	}

	retrieveData() {
		this.pingService('cloudinary', this.cloudinaryCheckUrl);
		this.pingService('customSchemeStore', this.customSchemeCheckUrl);
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
			} else {
				this.statuses[name].ok = true;
			}
		})
		.catch(() => {
			this.statuses[name].ok = false;
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
