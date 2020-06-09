'use strict';

module.exports = convertToCmsScheme;

function convertToCmsScheme() {
	const cmsRegExp = /^(https?:)?\/*(?:prod-upp-image-read\.ft\.com|com\.ft\.imagepublish\.(prod|prod-us|upp-prod-eu|upp-prod-us)\.s3\.amazonaws\.com|im\.ft-static\.com\/content\/images)\/([0-9a-f-]+)(?:\.(img|png|jpg|jpeg|gif))?(\?.+)?$/i;
	const sparkRegExp = /^(https?:)?\/*(?:d1e00ek4ebabms\.cloudfront\.net\/production|cct-images\.ft\.com\/production)\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}).*(\?.+)?$/i;
	return (request, response, next) => {
		let match = request.params.imageUrl.match(cmsRegExp);
		if (match && match[3]) {
			request.params.scheme = 'ftcms';
			request.params.originalImageUrl = request.params.imageUrl;
			request.params.imageUrl = `ftcms:${match[3]}`;
			if (match[5]) {
				request.params.imageUrl += match[5];
			}
			next();
		} else {
			match = request.params.imageUrl.match(sparkRegExp);
			if (match && match[2]) {
				request.params.scheme = 'ftcms';
				request.params.originalImageUrl = request.params.imageUrl;
				request.params.imageUrl = `ftcms:${match[2]}`;
				if (match[4]) {
					request.params.imageUrl += match[4];
				}
				next();
			} else {
				next();
			}
		}
	};
}
