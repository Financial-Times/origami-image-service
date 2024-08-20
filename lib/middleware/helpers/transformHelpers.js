const url = require('url');
const ImageTransform = require('../../image-transform');

function createTransform(transform, query, next) {
	try {
		transform = new ImageTransform(query);
	} catch (error) {
		error.status = 400;
		error.cacheMaxAge = '1y';
		return next(error);
	}
	return transform;
}

function sanitizeSvgUri(transform, config, request) {
	if (
		transform.uri &&
		(transform.format === 'svg' || /\.svg/i.test(transform.uri))
	) {
		const hasQueryString = url.parse(transform.uri).search;
		const encodedUri = encodeURIComponent(transform.uri);
		const tint = transform.tint ? transform.tint[0] : '';
		const hostname = config.hostname || request.hostname;
		const protocol = hostname === 'localhost' ? 'http' : 'https';
		const port = hostname === 'localhost' ? ':8080' : '';

		transform.setUri(
			`${protocol}://${hostname}${port}/__origami/service/image/v2/images/svgtint/${encodedUri}${
				hasQueryString ? '&' : '?'
			}color=${tint}`
		);

		// Clear the tint to avoid double tinting
		if (transform.tint) {
			transform.setTint();
		}
	}
}

function setAvifSupport(transform, request) {
	if (
		request.get('accept')?.includes('image/avif') &&
		transform.format === 'auto'
	) {
		transform.setFormat('avif');
	}
}

function setImmutableFlag(transform, isImmutable) {
	if (isImmutable) {
		transform.setImmutable(true);
	}
}

module.exports = {
	createTransform,
	sanitizeSvgUri,
	setAvifSupport,
	setImmutableFlag,
};
