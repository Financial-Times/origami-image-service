'use strict';

module.exports = convertToCmsScheme;

function convertToCmsScheme() {
	const cmsRegExp = /^(https?:)?\/\/(?:prod-upp-image-read\.ft\.com|com\.ft\.imagepublish\.prod(-us)?\.s3\.amazonaws\.com|im\.ft-static\.com\/content\/images)\/([0-9a-f-]+)(?:\.img)?(\?.+)?$/i;
	return (request, response, next) => {
		const match = request.params.imageUrl.match(cmsRegExp);
		if (match && match[3]) {
			request.params.imageUrl = `ftcms:${match[3]}`;
			if (match[4]) {
				request.params.imageUrl += match[4];
			}
		}
		next();
	};
}
