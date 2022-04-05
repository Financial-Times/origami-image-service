'use strict';

const httpError = require('http-errors');
const oneWeek = 60 * 60 * 24 * 7;
const probe = require('probe-image-size');

module.exports = getImageMeta;

function getImageMeta(request, response, next) {

	// Prevent JPEG-XR from causing issues
	let acceptHeader = request.headers.accept || '';
	if (acceptHeader && acceptHeader.includes('image/jxr')) {
		acceptHeader = '*/*';
	}

	// Get the image meta data
	return probe(request.appliedTransform, {

		// We need to pass on these client headers to support WebP.
		// Note: JPEG XR is not supported by the library we use to
		// calculate image dimensions, so we don't send the
		// User-Agent, falling back to JPEG
		headers: {
			Accept: acceptHeader
		}

	}).then(result => {
	// Match the V1 Image Service metadata JSON
		response.set({
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.send({
			dpr: request.transform.getDpr() || 1,
			type: result.mime,
			filesize: result.length,
			width: result.width,
			height: result.height
		});
	}).catch(error => {
		if (error.code === 'ECONTENT') {
			return next(httpError(500, 'Metadata could not be extracted from the requested image'));
		}
		if (error.message === 'Parse Error') {
			return next(httpError(500, 'Metadata could not be extracted from the requested image due to a parse error'));
		}
		if (error.status && error.status >= 400 && error.status < 500) {
			return next(httpError(error.status));
		}
		return next(error);
	});

}
