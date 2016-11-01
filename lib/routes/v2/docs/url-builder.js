'use strict';

const oneWeek = 60 * 60 * 24 * 7;
const querystring = require('querystring');

module.exports = (app, router) => {

	// v2 url-builder page
	router.get('/v2/docs/url-builder', (request, response) => {

		// Gather form data
		const formData = {
			url: request.query.url || 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
			source: request.query.source,
			width: request.query.width,
			height: request.query.height,
			tint: request.query.tint,
			fit: {
				value: request.query.fit,
				isCover: (request.query.fit === 'cover' || !request.query.fit),
				isContain: (request.query.fit === 'contain'),
				isScaleDown: (request.query.fit === 'scale-down')
			},
			format: {
				value: request.query.format,
				isAuto: (request.query.format === 'auto' || !request.query.format),
				isJpg: (request.query.format === 'jpg'),
				isPng: (request.query.format === 'png'),
				isGif: (request.query.format === 'gif'),
				isSvg: (request.query.format === 'svg')
			},
			quality: {
				value: request.query.quality,
				isLowest: (request.query.quality === 'lowest'),
				isLow: (request.query.quality === 'low'),
				isMedium: (request.query.quality === 'medium' || !request.query.quality),
				isHigh: (request.query.quality === 'high'),
				isHighest: (request.query.quality === 'highest'),
				isLossless: (request.query.quality === 'lossless')
			}
		};

		// Build the image preview URL
		let imagePreviewUrl;
		if (formData.url) {
			imagePreviewUrl = buildUrl(formData);
		}

		// Build the demo URLs
		const demo = {
			url: buildDemoUrl('http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'),
			cms: buildDemoUrl('ftcms:3520df36-8c20-11e6-8cb7-e7ada1d123b1'),
			icon: buildDemoUrl('fticon:brand-ft')
		};

		// Response
		response.set({
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': `public, stale-while-revalidate=${oneWeek}, max-age=${oneWeek}`
		});
		response.render('url-builder', {
			layout: 'main',
			title: 'URL Builder - Origami Image Service',
			form: formData,
			imagePreviewUrl,
			demo
		});
	});

	function buildUrl(data) {
		const sanitizedData = sanitizeData(data);
		const query = querystring.stringify(sanitizedData);
		return `v2/images/raw/${sanitizedData.url}?${query}`;
	}

	function buildDemoUrl(url) {
		return `v2/docs/url-builder?url=` + encodeURIComponent(url);
	}

	function sanitizeData(data) {
		const sanitizedData = {
			url: encodeURIComponent(data.url),
			source: data.source || 'url-builder',
			width: data.width,
			height: data.height,
			tint: data.tint,
			fit: data.fit.value,
			format: data.format.value,
			quality: data.quality.value
		};
		if (!sanitizedData.width) {
			delete sanitizedData.width;
		}
		if (!sanitizedData.height) {
			delete sanitizedData.height;
		}
		if (!sanitizedData.tint) {
			delete sanitizedData.tint;
		}
		if (!sanitizedData.fit) {
			delete sanitizedData.fit;
		}
		if (!sanitizedData.format) {
			delete sanitizedData.format;
		}
		if (!sanitizedData.quality) {
			delete sanitizedData.quality;
		}
		return sanitizedData;
	}

};
