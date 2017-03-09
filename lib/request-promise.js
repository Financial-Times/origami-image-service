'use strict';

const request = require('request');

module.exports = requestPromise;

function requestPromise(options) {
	return new Promise((resolve, reject) => {
		request(options, (error, response) => {
			if (error) {
				return reject(error);
			}
			resolve(response);
		});
	});
}
