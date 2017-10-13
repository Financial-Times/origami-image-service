'use strict';

const FastlyPurge = require('fastly-purge');
const addHours = require('date-fns/add_hours');
const startOfHour = require('date-fns/start_of_hour');
const getHours = require('date-fns/get_hours');
const differenceInMilliseconds = require('date-fns/difference_in_milliseconds');

let timer;

const urlsToPurge = {};

module.exports = (fastlyApiKey, fastlyServiceId) => {

	if (!fastlyApiKey) {
		throw new Error('Function requires a Fastly API key to be passed in as the first argument.');
	}

	if (!fastlyServiceId) {
		throw new Error('Function requires a Fastly Service ID to be passed in as the second argument.');
	}

	const fastly = new FastlyPurge(fastlyApiKey, {
		softPurge: true
	});

	return function addToPurgeQueue(url, options) {
		options = options || {};
		const isKey = options.isKey;

		const dateToPurge = startOfHour(addHours(new Date(), 2));
		const hourToPurge = getHours(dateToPurge);

		if (!urlsToPurge[hourToPurge]) {
			urlsToPurge[hourToPurge] = {};
			urlsToPurge[hourToPurge].urls = new Set();
			urlsToPurge[hourToPurge].keys = new Set();
		}

		if (isKey) {
			urlsToPurge[hourToPurge].keys.add(url);
		} else {
			urlsToPurge[hourToPurge].urls.add(url);
		}

		if (!timer) {
			timer = setTimeout(() => {
				timer = undefined;
				const nowHour = getHours(new Date());
				const urls = urlsToPurge[nowHour].urls;
				const keys = urlsToPurge[nowHour].keys;

				if (urls) {
					for (const url of urls) {
						fastly.url(url, {
							apiKey: fastlyApiKey
						}, error => {
							if (error) {
								console.log(`Could not purge ${url} from Fastly.`);
							} else {
								console.log(`Purged ${url} from Fastly`);
							}
							urls.delete(url);
						});
					}
				}

				delete urlsToPurge[nowHour];

			}, differenceInMilliseconds(dateToPurge, new Date()));
		}

		return dateToPurge;
	};
};
