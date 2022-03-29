'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const path = require('path');
const querystring = require('querystring');
const navigation = require('../../../../data/navigation.json');

module.exports = app => {

	// v2 url-builder page
	app.get([
		'/v2/docs/url-builder',
		'/__origami/service/image/v2/docs/url-builder',
	], cacheControl({maxAge: '7d'}), (request, response) => {
		// If there's no URL, trip into preview mode
		let url = request.query.url;
		if (!url) {
			url = 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img';
			request.query.preview = true;
		}

		// Gather form data
		const formData = {
			url,
			source: request.query.source,
			width: request.query.width,
			height: request.query.height,
			tint: request.query.tint,
			bgcolor: request.query.bgcolor,
			fit: {
				value: request.query.fit,
				isCover: !request.query.fit,
				isContain: (request.query.fit === 'contain'),
				isFill: (request.query.fit === 'fill'),
				isScaleDown: (request.query.fit === 'scale-down')
			},
			gravity: {
				value: request.query.gravity,
				isNone: !request.query.gravity,
				isFaces: (request.query.gravity === 'faces'),
				isPoi: (request.query.gravity === 'poi')
			},
			format: {
				value: request.query.format,
				isAuto: !request.query.format,
				isJpg: (request.query.format === 'jpg'),
				isPng: (request.query.format === 'png'),
				isGif: (request.query.format === 'gif'),
				isSvg: (request.query.format === 'svg')
			},
			quality: {
				value: request.query.quality,
				isLowest: (request.query.quality === 'lowest'),
				isLow: (request.query.quality === 'low'),
				isMedium: !request.query.quality,
				isHigh: (request.query.quality === 'high'),
				isHighest: (request.query.quality === 'highest'),
				isLossless: (request.query.quality === 'lossless')
			}
		};

		const defaultSource = 'image-url-builder';

		// Make the preview source work
		if (!formData.source && request.query.preview) {
			formData.source = defaultSource;
		}

		// Build the image preview URL
		let imagePreviewUrl;
		if (formData.url) {
			imagePreviewUrl = buildUrl(formData);
		}

		// Remove the preview source once we've used it
		if (request.query.preview && formData.source === defaultSource) {
			delete formData.source;
		}

		// Build the demo URLs
		const demo = {
			url: buildDemoUrl('https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'),
			cms: buildDemoUrl('ftcms:3520df36-8c20-11e6-8cb7-e7ada1d123b1'),
			flag: buildDemoUrl('ftflag-v1:eu'),
			icon: buildDemoUrl('fticon-v1:book'),
			social: buildDemoUrl('ftsocial-v2:twitter'),
			logo: buildDemoUrl('ftlogo-v1:brand-ft-masthead')
		};

		for (const item of navigation.items) {
			if (item.href === request.path || item.href === path.join('/__origami/service/image', request.path)) {
				item.current = true;
			} else {
				item.current = false;
			}
		}

		// Response
		response.render('url-builder', {
			title: 'URL Builder - Origami Image Service',
			form: formData,
			imagePreviewUrl,
			demo,
			navigation
		});
	});

	function buildUrl(data) {
		const sanitizedData = sanitizeData(data);
		const url = sanitizedData.url;
		delete sanitizedData.url;
		const query = querystring.stringify(sanitizedData);
		const hostname = app.ft.options.hostname || 'www.ft.com';
		const protocol = hostname === 'localhost' ? 'http' : 'https';
		return new URL(`/__origami/service/image/v2/images/raw/${url}?${query}`, `${protocol}://${hostname}`);
	}

	function buildDemoUrl(url) {
		return `/__origami/service/image/v2/docs/url-builder?url=${encodeURIComponent(url)}&preview=true`;
	}

	function sanitizeData(data) {
		const sanitizedData = {
			url: encodeURIComponent(data.url),
			source: data.source,
			width: data.width,
			height: data.height,
			tint: data.tint,
			bgcolor: data.bgcolor,
			fit: data.fit.value,
			gravity: data.gravity.value,
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
		if (!sanitizedData.bgcolor) {
			delete sanitizedData.bgcolor;
		}
		if (!sanitizedData.fit) {
			delete sanitizedData.fit;
		}
		if (!sanitizedData.gravity) {
			delete sanitizedData.gravity;
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
