'use strict';

const httpError = require('http-errors');
const cloudinary = require('cloudinary');
const purgeFromFastly = require('../purge-from-fastly');
const ImageTransform = require('../image-transform');
const base64 = require('base-64');
const utf8 = require('utf8');

function encodeKeys(key = '') {
	return base64.encode(utf8.encode(key));
}

module.exports = function ({
	cloudinaryAccountName,
	cloudinaryApiKey,
	cloudinaryApiSecret,
	fastlyApiKey,
	fastlyServiceId,
	customSchemeStore,
	customSchemeCacheBust
}) {
	cloudinary.config({
		cloud_name: cloudinaryAccountName,
		api_key: cloudinaryApiKey,
		api_secret: cloudinaryApiSecret
	});

	const scheduleToPurgeFromFastly = purgeFromFastly(fastlyApiKey, fastlyServiceId);

	return function purgeUrlMiddleware(request, response, next) {
		if (!request.query.url) {
			return next(httpError(400, 'Please url-encode the url you want to purge and add it as the value to the query parameter `url`. E.G. `/purge/url?url=`'));
		}

		const url = decodeURIComponent(request.query.url);

		return cloudinary.uploader.destroy(
				url,
				() => {}, {
					public_id: url,
					invalidate: true,
					resource_type: 'image',
					type: 'fetch'
				}
			)
			.then(() => {
				if (request.query.transforms) {
					const keyForCustomSchemeUrl = encodeKeys(ImageTransform.resolveCustomSchemeUri(url, customSchemeStore, customSchemeCacheBust));
					const dateToPurge = scheduleToPurgeFromFastly(keyForCustomSchemeUrl, {
						isKey: true
					});
					response.status(200).send(`Purged ${url} from Cloudinary, will purge key ${keyForCustomSchemeUrl} from Fastly at ${dateToPurge}`);

				} else {
					const dateToPurge = scheduleToPurgeFromFastly(url);
					response.status(200).send(`Purged ${url} from Cloudinary, will purge from Fastly at ${dateToPurge}`);
				}
			})
			.catch(error => next(httpError(500, error)));
	};
};