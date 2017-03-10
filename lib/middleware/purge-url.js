'use strict';

const httpError = require('http-errors');
const cloudinary = require('cloudinary');
const scheduleToPurgeFromFastly = require('../purge-from-fastly');

module.exports = function (config) {

	cloudinary.config({
		cloud_name: config.cloudinaryAccountName,
		api_key: config.cloudinaryApiKey,
		api_secret: config.cloudinaryApiSecret
	});

	return function purgeUrlMiddleware(request, response, next) {
		if (!request.query.url) {
			return next(httpError(400, 'Please url-encode the url you want to purge and add it as the value to the query parameter `url`. E.G. `/purge/url?url=`'));
		}

		const url = decodeURIComponent(request.query.url);

		return cloudinary.uploader.destroy(
			url,
			() => {},
			{
				public_id: url,
				invalidate: true,
				resource_type: 'image',
				type: 'fetch'
			}
		)
			.then(result => {
				if (result.result === 'not found') {
					throw new Error(`Can not purge ${url} as it is not cached by Cloudinary.`);
				}
				return url;
			})
			.then(scheduleToPurgeFromFastly)
			.then(dateToPurge => {
				response.status(200).send(`Purged ${url} from Cloudinary, will purge from Fastly at ${dateToPurge}`);
			})
			.catch(error => next(httpError(500, error)));
	};
};