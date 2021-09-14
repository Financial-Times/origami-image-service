'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	ftbrand: 'ftbrand:brussels-blog',
	ftcms: 'ftcms:6c5a2f8c-18ca-4afa-80ff-7d56e41172b1',
	capiv1: 'ftcms:be875529-7675-43d8-b461-b304410398c2',
	capiv2: 'ftcms:03b59122-a148-11e9-a282-2df48f366f7d',
	spark: 'ftcms:c3fec7fb-aba9-42ee-a745-a62c872850d0',
	sparkMasterImage: 'ftcms:817dd37c-b808-4b32-9db2-d50bdd92372b',
	ftflag: 'ftflag:jp',
	fthead: 'fthead:martin-wolf',
	fticon: 'fticon:cross',
	ftlogo: 'ftlogo:brand-ft',
	ftpodcast: 'ftpodcast:arts',
	ftsocial: 'ftsocial:whatsapp',
	httpsspark: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
	httpftcms: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcms: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpftcmsmalformed: 'http:/im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcmsmalformed: 'https:im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	http: 'http://origami-images.ft.com/ftsocial/v1/twitter.svg',
	https: 'https://origami-images.ft.com/ftsocial/v1/twitter.svg',
	protocolRelative: '//origami-images.ft.com/ftsocial/v1/twitter.svg',
	protocolRelativeftcms: '//im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	specialisttitle: 'specialisttitle:ned-logo',
	nonUtf8Characters: 'https://origami-image-service-integration-tests.s3-eu-west-1.amazonaws.com/Beaute%CC%81.jpg'
};


describe('GET /v2/images/debug…', function () {

	describe('http', function () {
		setupRequest('GET', `/v2/images/debug/${testImageUris.httpftcms}?source=test&width=123&height=456&echo`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('application/json');

		it('responds with JSON representing the transforms in the image request', function (done) {
			this.request.expect(response => {
				assert.isObject(response.body);
				assert.deepEqual(response.body.transform, {
					fit: 'cover',
					format: 'auto',
					height: 456,
					quality: 72,
					uri: testImageUris.httpftcms,
					width: 123,
					immutable: true,
					name: '15a8ed456065fe9f8193405a81d4ee3d1531876634177efe359a662496d62793'
				});
				assert.match(response.body.appliedTransform, new RegExp('^https://res.cloudinary.com/financial-times/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive.immutable_cache,h_456,q_72,w_123/15a8ed456065fe9f8193405a81d4ee3d1531876634177efe359a662496d62793$'));
			}).end(done);
		});
	});


	const imagesWithSchemes = {
		ftcms: {
			requestedUrl: 'ftcms:6c5a2f8c-18ca-4afa-80ff-7d56e41172b1',
			resolvedUrl: 'https://im.ft-static.com/content/images/6c5a2f8c-18ca-4afa-80ff-7d56e41172b1.img'
		},
		capiv1: {
			requestedUrl: 'ftcms:be875529-7675-43d8-b461-b304410398c2',
			resolvedUrl: 'https://im.ft-static.com/content/images/be875529-7675-43d8-b461-b304410398c2.img'
		},
		capiv2: {
			requestedUrl: 'ftcms:03b59122-a148-11e9-a282-2df48f366f7d',
			resolvedUrl: /http:\/\/com\.ft\.imagepublish\.upp-prod-(eu|us)\.s3\.amazonaws\.com\/03b59122-a148-11e9-a282-2df48f366f7d/,
		},
		spark: {
			requestedUrl: 'ftcms:c3fec7fb-aba9-42ee-a745-a62c872850d0',
			resolvedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/c3fec7fb-aba9-42ee-a745-a62c872850d0.jpg'
		},
		sparkMasterImage: {
			requestedUrl: 'ftcms:817dd37c-b808-4b32-9db2-d50bdd92372b',
			resolvedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg'
		},
		httpsspark: {
			requestedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
			resolvedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg'
		},
		httpspark: {
			requestedUrl: 'http://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
			resolvedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg'
		},
		httpssparkcustomdomain: {
			requestedUrl: 'https://cct-images.ft.com/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
			resolvedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg'
		},
		httpsparkcustomdomain: {
			requestedUrl: 'http://cct-images.ft.com/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
			resolvedUrl: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg'
		},
		httpftcms: {
			requestedUrl: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
			resolvedUrl: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
		},
		httpsftcms: {
			requestedUrl: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
			resolvedUrl: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
		},
		httpftcmsmalformed: {
			requestedUrl: 'http:/im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
			resolvedUrl: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
		},
		httpsftcmsmalformed: {
			requestedUrl: 'https:im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
			resolvedUrl: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
		},
	};

	for (const [test, {
			requestedUrl,
			resolvedUrl
		}] of Object.entries(imagesWithSchemes)) {
		describe(`resolving urls which have custom schemes: ${test} -- ${requestedUrl} should resolve to ${resolvedUrl}`, function () {
			setupRequest('GET', `/v2/images/debug/${requestedUrl}?source=test&width=123&height=456`);
			itRespondsWithStatus(200);
			itRespondsWithContentType('application/json');

			it('responds with the correct location of the original image', function (done) {
				this.request.expect(response => {
					const actual = response.body.transform.uri;
					if (typeof resolvedUrl === 'string') {
						assert.deepEqual(actual, resolvedUrl, `Expected ${requestedUrl} to match ${resolvedUrl} but it actually resolved to ${actual}`);
					} else {
						assert.match(actual, resolvedUrl, `Expected ${requestedUrl} to match to ${resolvedUrl} but it actually resolved to ${actual}`);
					}
				}).end(done);
			});
		});
	}
});
