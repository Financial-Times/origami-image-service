'use strict';

const assert = require('proclaim');
const axios = require('../helpers/axios');

const customSchemeStore = `${(process.env.CUSTOM_SCHEME_STORE || process.env.HOST || 'https://origami-image-service-dev.herokuapp.com')}/__origami/service/image/v2/images/raw/ftsocial-v1%3Atwitter%3Fsource%3Dorigami-image-service`;

const httpCustomSchemeStore = new URL(customSchemeStore);
httpCustomSchemeStore.protocol = 'http';

const httpsCustomSchemeStore = new URL(customSchemeStore);
httpsCustomSchemeStore.protocol = 'https';

const testImageUris = {
	ftbrand: 'ftbrand-v1:brand-ft-money',
	fthead: 'fthead-v1%3A%C3%A6ndra-rininsland',
	ftcms: 'ftcms:6c5a2f8c-18ca-4afa-80ff-7d56e41172b1',
	ftflag: 'ftflag:jp',
	fticon: 'fticon:cross',
	ftlogo: 'ftlogo:brand-ft',
	ftsocial: 'ftsocial:whatsapp',
	specialisttitle: 'specialisttitle:ned-logo',
	capiv1: 'ftcms:be875529-7675-43d8-b461-b304410398c2',
	capiv2: 'ftcms:03b59122-a148-11e9-a282-2df48f366f7d',
	spark: 'ftcms:c3fec7fb-aba9-42ee-a745-a62c872850d0',
	sparkMasterImage: 'ftcms:817dd37c-b808-4b32-9db2-d50bdd92372b',
	httpsspark: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
	httpftcms: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcms: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpftcmsmalformed: 'http:/im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcmsmalformed: 'https:im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	http: httpCustomSchemeStore.toString(),
	httpmalformed: httpCustomSchemeStore.toString().replace('http://', 'http:/'),
	https: httpsCustomSchemeStore.toString(),
	httpsmalformed: httpsCustomSchemeStore.toString().replace('https://', 'https:/'),
	protocolRelative: httpsCustomSchemeStore.toString().replace('https:', ''),
	protocolRelativeftcms: '//im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	nonUtf8Characters: 'https://origami-image-service-integration-tests.s3-eu-west-1.amazonaws.com/Beaute%CC%81.jpg',
	oldLiveBlogsDomainHttp: 'http://blogs.ft.com/tech-blog/files/2012/03/Screen-Shot-2012-03-01-at-11.25.02-PM-391x270.png',
	oldLiveBlogsDomainHttps: 'https://blogs.ft.com/tech-blog/files/2012/03/Screen-Shot-2012-03-01-at-11.25.02-PM-391x270.png',
};

const usingExternalServer = Boolean(process.env.HOST);
const onlyRunOnExternalServer = usingExternalServer ? describe : describe.skip;

describe('GET /__origami/service/image/v2/images/raw…', function() {

	describe('/http://blogs.r.ftdata.co.uk', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.oldLiveBlogsDomainHttp}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https://blogs.r.ftdata.co.uk', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.oldLiveBlogsDomainHttps}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/http://… (HTTP scheme unencoded)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https://… (HTTPS scheme unencoded)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.nonUtf8Characters}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/http%3A%2F%2F… (HTTP scheme encoded)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${encodeURIComponent(testImageUris.httpftcms)}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https%3A%2F%2F… (HTTPS scheme encoded)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${encodeURIComponent(testImageUris.httpsftcms)}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/http:/… (HTTP scheme url unencoded malformed)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpmalformed}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/png');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https:… (HTTPS scheme url unencoded malformed)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsmalformed}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/png');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/http:/… (HTTP scheme with ftcms url unencoded malformed)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcmsmalformed}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https:… (HTTPS scheme with ftcms url unencoded malformed)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsftcmsmalformed}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/http%3A%2F… (HTTP scheme encoded malformed)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${encodeURIComponent(testImageUris.httpftcmsmalformed)}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https%3A… (HTTPS scheme encoded malformed)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${encodeURIComponent(testImageUris.httpsftcmsmalformed)}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('///… (protocol-relative unencoded)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/2F%2F… (protocol-relative encoded)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${encodeURIComponent(testImageUris.protocolRelativeftcms)}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/ftbrand:… (ftbrand scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/ftbrand:… (ftbrand scheme with querystring)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftbrand}%3Ffoo%3Dbar?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/ftcms:… (ftcms scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/ftcms:… (capiv1 scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.capiv1}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/ftcms:… (capiv2 scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.capiv2}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/ftcms:… (spark scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.spark}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/ftcms:… (sparkMasterImage scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.sparkMasterImage}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/https:… (httpsspark scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsspark}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('/ftcms:… (ftcms scheme with querystring)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftcms}%3Ffoo%3Dbar?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/ftflag:… (ftflag scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/ftflag:… (ftflag scheme with querystring)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftflag}%3Ffoo%3Dbar?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/fticon:… (fticon scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/fticon:… (fticon scheme with querystring)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fticon}%3Ffoo%3Dbar?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/ftsocial:… (ftsocial scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/ftlogo:… (ftlogo scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/specialisttitle:… (specialisttitle scheme)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('/specialisttitle:… (specialisttitle scheme with querystring)', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.specialisttitle}%3Ffoo%3Dbar?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/svg+xml');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('without a `source` query parameter', function() {
		it('responds with a descriptive error message', async function() {
			this.timeout(30000);
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}`);
			assert.equal(response.status, 400);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
			assert.match(response.data, /the source parameter is required/i);
		});

	});

	describe('when a transform query parameter is invalid', function() {
		it('responds with a descriptive error message', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service&bgcolor=f0`);
			assert.equal(response.status, 400);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
			assert.match(response.data, /image bgcolor must be a valid hex code or color name/i);
		});

	});

	describe('when a dpr is set', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service&dpr=2`);
			assert.equal(response.headers['content-dpr'], '2');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when a dpr is not set', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
			assert.isUndefined(response.headers['content-dpr']);
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	onlyRunOnExternalServer('when a custom scheme image is not found', function() {
		it('responds with a 400 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/images/raw/ftbrand-v1:notabrand?source=origami-image-service');
			assert.equal(response.status, 400);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when a CMS image is not found', function() {
		it('responds with a 404 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/images/raw/ftcms:notanid?source=origami-image-service');
			assert.equal(response.status, 404);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when an HTTP image is not found', function() {
		it('responds with a 404 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/images/raw/https://www.ft.com/notapage?source=origami-image-service');
			assert.equal(response.status, 404);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when an image responds with HTML', function() {
		it('responds with a 400 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/images/raw/https://www.ft.com/?source=origami-image-service');
			assert.equal(response.status, 400);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when a request has no image specified', function() {
		it('responds with a 400 status', async function() {
			const response = await axios.get('/__origami/service/image/v2/images/raw/?source=origami-image-service');
			assert.equal(response.status, 400);
			assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when an image starts with a spaces', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/%20%20%20%20${testImageUris.httpsftcms}?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when an image ends with spaces', function() {
		it('responds with a 200 status', async function() {
			const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsftcms}%20%20%20?source=origami-image-service`);
			assert.equal(response.status, 200);
			assert.equal(response.headers['content-type'], 'image/jpeg');
			assert.match(response.headers['surrogate-key'], /origami-image-service/);
			assert.equal(response.headers['timing-allow-origin'], '*');
			assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
		});
	});

	describe('when the \'format\' query parameter is \'auto\'', () => {

		const firefoxUA = 'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0';
		const chromeUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36';
		const ieUA = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

		[
			{
				accept: '*/*',
				userAgent: firefoxUA,
				expectedContentType: 'image/jpeg',
			},
			{
				accept: 'image/avif',
				userAgent: firefoxUA,
				expectedContentType: 'image/avif',
			},
			{
				accept: 'image/webp',
				userAgent: firefoxUA,
				expectedContentType: 'image/webp',
			},
			{
				accept: 'image/jxr',
				userAgent: firefoxUA,
				expectedContentType: 'image/vnd.ms-photo',
			},
			{
				accept: '*/*',
				userAgent: chromeUA,
				expectedContentType: 'image/jpeg',
			},
			{
				accept: 'image/avif',
				userAgent: chromeUA,
				expectedContentType: 'image/avif',
			},
			{
				accept: 'image/webp',
				userAgent: chromeUA,
				expectedContentType: 'image/webp',
			},
			{
				accept: 'image/jxr',
				userAgent: chromeUA,
				expectedContentType: 'image/vnd.ms-photo',
			},
			{
				accept: '*/*',
				userAgent: ieUA,
				expectedContentType: 'image/jpeg',
			},
			{
				accept: 'image/avif',
				userAgent: ieUA,
				expectedContentType: 'image/avif',
			},
			{
				accept: 'image/webp',
				userAgent: ieUA,
				expectedContentType: 'image/webp',
			},
			{
				accept: 'image/jxr',
				userAgent: ieUA,
				expectedContentType: 'image/vnd.ms-photo',
			},
		].forEach(({accept, userAgent, expectedContentType}) => {
			it(`when the 'user-agent' header is ${userAgent} and the 'accepts' header is ${accept}`, async function() {
				const response = await axios.get(
                    `/__origami/service/image/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service&format=auto`,
                    {
						headers: {
							accept: accept,
							'user-agent': userAgent,
						}
					}
                );
				assert.equal(response.headers['content-type'], expectedContentType);
				assert.match(response.headers['surrogate-key'], /origami-image-service/);
				assert.equal(response.headers['timing-allow-origin'], '*');
				assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
			});
		});
	});

	context('when an image is returned, surrogate keys are added', function() {
		describe('adds generic key for all image requests:', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('ftcms', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftflag', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('fticon', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftlogo', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftsocial', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('http', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('https', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('protocolRelative', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				it('adds correct surrogate key', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});
		});

		describe('adds specific keys for image content types', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2Uvc3ZnK3htbA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('ftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2UvanBlZw==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftflag', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2Uvc3ZnK3htbA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('fticon', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2Uvc3ZnK3htbA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftlogo', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2Uvc3ZnK3htbA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftsocial', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2Uvc3ZnK3htbA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('http', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2UvanBlZw==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('https', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2UvanBlZw==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('protocolRelative', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2UvanBlZw==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aW1hZ2Uvc3ZnK3htbA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});
		});

		describe('adds specific keys for image schemes', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRicmFuZA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('ftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftflag', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRmbGFn/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('fticon', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRpY29u/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftlogo', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRsb2dv/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftsocial', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRzb2NpYWw=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('httpftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('httpsftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('http', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.http}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aHR0cDo=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('https', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.https}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aHR0cHM6Ly9vcmlnYW1pL/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('protocolRelativeftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('protocolRelative', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelative}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aHR0cA==/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /c3BlY2lhbGlzdHRpdGxl/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});
		});

		describe('adds key for specific image requested', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRicmFuZC12MTpicmFuZC1mdC1tb25leQ/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('ftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM6NmM1YTJmOGMtMThjYS00YWZhLTgwZmYtN2Q1NmU0MTE3MmIx/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftflag', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRmbGFnOmpw/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('fthead', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fthead}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRoZWFkLXYx/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('fticon', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRpY29uOmNyb3Nz/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftlogo', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRsb2dvOmJyYW5kLWZ0/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('ftsocial', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRzb2NpYWw6d2hhdHNhcHA=/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('httpftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('httpsftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('http', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.http}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aHR0cDovL29yaWdhbWkta/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('https', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.https}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aHR0cHM6Ly9vcmlnYW1pL/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('protocolRelativeftcms', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('protocolRelative', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.protocolRelative}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /Ly9vcmlnYW1pLWltYWdl/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /c3BlY2lhbGlzdHRpdGxlOm5lZC1sb2dv/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});

			describe('nonUtf8Characters', function() {
				it('adds correct surrogate keys', async function() {
					const response = await axios.get(`/__origami/service/image/v2/images/raw/${testImageUris.nonUtf8Characters}?source=origami-image-service`);
					assert.match(response.headers['surrogate-key'], /aHR0cHM6Ly9vcmlnYW1pLWltYWdlLXNlcnZpY2UtaW50ZWdyYXRpb24tdGVzdHMuczMtZXUtd2VzdC0xLmFtYXpvbmF3cy5jb20vQmVhdXRlzIEuanBn/);
					assert.match(response.headers['surrogate-key'], /origami-image-service/);
					assert.equal(response.headers['timing-allow-origin'], '*');
					assert.equal(response.headers['ft-suppress-friendly-error'], 'true');
				});
			});
		});
	});
});
