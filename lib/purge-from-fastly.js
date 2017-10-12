'use strict';

const FastlyPurge = require('fastly-purge');
const addHours = require('date-fns/add_hours');
const startOfHour = require('date-fns/start_of_hour');
const getHours = require('date-fns/get_hours');
const differenceInMilliseconds = require('date-fns/difference_in_milliseconds');

let timer;

const urlsToPurge = {};

module.exports = fastlyApiKey => {

	if (!fastlyApiKey) {
		throw new Error('Function requires a Fastly API key to be passed in as the first argument.');
	}

	const fastly = new FastlyPurge(fastlyApiKey, {
		softPurge: true
	});

	return function addToPurgeQueue(url) {

		const dateToPurge = startOfHour(addHours(new Date(), 2));
		const hourToPurge = getHours(dateToPurge);

		if (!urlsToPurge[hourToPurge]) {
			urlsToPurge[hourToPurge] = new Set();
		}

		urlsToPurge[hourToPurge].add(url);

		if (!timer) {
			timer = setTimeout(() => {
				timer = undefined;
				const nowHour = getHours(new Date());
				const urls = urlsToPurge[nowHour];

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
