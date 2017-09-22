'use strict';

const httpError = require('http-errors');
const cloudinary = require('cloudinary');
const purgeFromFastly = require('../purge-from-fastly');

module.exports = function ({cloudinaryAccountName, cloudinaryApiKey, cloudinaryApiSecret, fastlyApiKey}) {

	cloudinary.config({
		cloud_name: cloudinaryAccountName,
		api_key: cloudinaryApiKey,
		api_secret: cloudinaryApiSecret
	});

	const scheduleToPurgeFromFastly = purgeFromFastly(fastlyApiKey);

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
			.then(() => {
				return url;
			})
			.then(scheduleToPurgeFromFastly)
			.then(dateToPurge => {
				response.status(200).send(`Purged ${url} from Cloudinary, will purge from Fastly at ${dateToPurge}`);
			})
			.catch(error => next(httpError(500, error)));
	};
};