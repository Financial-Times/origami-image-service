'use strict';

const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itDoesNotRespondWithHeader = require('../helpers/it-does-not-respond-with-header');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const customSchemeStore = `${(process.env.CUSTOM_SCHEME_STORE || process.env.HOST || 'https://origami-image-service-dev.herokuapp.com')}/v2/images/raw/ftsocial-v1%3Atwitter%3Fsource%3Dorigami-image-service`;

const httpCustomSchemeStore = new URL(customSchemeStore);
httpCustomSchemeStore.protocol = 'http';

const httpsCustomSchemeStore = new URL(customSchemeStore);
httpsCustomSchemeStore.protocol = 'https';

const testImageUris = {
	ftbrand: 'ftbrand-v1:brand-ft-money',
	fthead: 'fthead-v1:ændra-rininsland',
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

describe('GET /v2/images/raw…', function() {

	describe('/http://blogs.r.ftdata.co.uk', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.oldLiveBlogsDomainHttp}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https://blogs.r.ftdata.co.uk', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.oldLiveBlogsDomainHttps}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http://… (HTTP scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https://… (HTTPS scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.nonUtf8Characters}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http%3A%2F%2F… (HTTP scheme encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpftcms)}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https%3A%2F%2F… (HTTPS scheme encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpsftcms)}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http:/… (HTTP scheme url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpmalformed}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/https:… (HTTPS scheme url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsmalformed}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/http:/… (HTTP scheme with ftcms url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcmsmalformed}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https:… (HTTPS scheme with ftcms url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcmsmalformed}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http%3A%2F… (HTTP scheme encoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpftcmsmalformed)}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https%3A… (HTTPS scheme encoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpsftcmsmalformed)}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('///… (protocol-relative unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/2F%2F… (protocol-relative encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.protocolRelativeftcms)}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	onlyRunOnExternalServer('/ftbrand:… (ftbrand scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/ftbrand:… (ftbrand scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}%3Ffoo%3Dbar?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/ftcms:… (ftcms scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (capiv1 scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.capiv1}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (capiv2 scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.capiv2}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (spark scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.spark}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (sparkMasterImage scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.sparkMasterImage}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https:… (httpsspark scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsspark}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (ftcms scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}%3Ffoo%3Dbar?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	onlyRunOnExternalServer('/ftflag:… (ftflag scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/ftflag:… (ftflag scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}%3Ffoo%3Dbar?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/fticon:… (fticon scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/fticon:… (fticon scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}%3Ffoo%3Dbar?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/ftsocial:… (ftsocial scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/ftlogo:… (ftlogo scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/specialisttitle:… (specialisttitle scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	onlyRunOnExternalServer('/specialisttitle:… (specialisttitle scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}%3Ffoo%3Dbar?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('without a `source` query parameter', function() {

		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}`);
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');

		it('responds with a descriptive error message', function(done) {
			this.timeout(30000);
			this.request.expect(/the source parameter is required/i).end(done);
		});

	});

	describe('when a transform query parameter is invalid', function() {

		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service&bgcolor=f0`);
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');

		it('responds with a descriptive error message', function(done) {
			this.request.expect(/image bgcolor must be a valid hex code or color name/i).end(done);
		});

	});

	describe('when a dpr is set', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service&dpr=2`);
		itRespondsWithHeader('content-Dpr', '2');
	});

	describe('when a dpr is not set', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
		itDoesNotRespondWithHeader('content-Dpr');
	});

	onlyRunOnExternalServer('when a custom scheme image is not found', function() {
		setupRequest('GET', '/v2/images/raw/ftbrand-v1:notabrand?source=origami-image-service');
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');
	});

	describe('when a CMS image is not found', function() {
		setupRequest('GET', '/v2/images/raw/ftcms:notanid?source=origami-image-service');
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an HTTP image is not found', function() {
		setupRequest('GET', '/v2/images/raw/https://www.ft.com/notapage?source=origami-image-service');
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an image responds with HTML', function() {
		setupRequest('GET', '/v2/images/raw/https://www.ft.com/?source=origami-image-service');
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');
	});

	describe('when a request has no image specified', function() {
		setupRequest('GET', '/v2/images/raw/?source=origami-image-service');
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');
	});

	describe('when an image starts with a spaces', function() {
		setupRequest('GET', `/v2/images/raw/%20%20%20%20${testImageUris.httpsftcms}?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('when an image ends with spaces', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}%20%20%20?source=origami-image-service`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
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
				expectedFtImageFormat: 'default'
			},
			{
				accept: 'image/webp',
				userAgent: firefoxUA,
				expectedContentType: 'image/webp',
				expectedFtImageFormat: 'webp'
			},
			{
				accept: 'image/jxr',
				userAgent: firefoxUA,
				expectedContentType: 'image/vnd.ms-photo',
				expectedFtImageFormat: 'jpegxr'
			},
			{
				accept: '*/*',
				userAgent: chromeUA,
				expectedContentType: 'image/jpeg',
				expectedFtImageFormat: 'default'
			},
			{
				accept: 'image/webp',
				userAgent: chromeUA,
				expectedContentType: 'image/webp',
				expectedFtImageFormat: 'webp'
			},
			{
				accept: 'image/jxr',
				userAgent: chromeUA,
				expectedContentType: 'image/vnd.ms-photo',
				expectedFtImageFormat: 'jpegxr'
			},
			{
				accept: '*/*',
				userAgent: ieUA,
				expectedContentType: 'image/jpeg',
				expectedFtImageFormat: 'default'
			},
			{
				accept: 'image/webp',
				userAgent: ieUA,
				expectedContentType: 'image/webp',
				expectedFtImageFormat: 'webp'
			},
			{
				accept: 'image/jxr',
				userAgent: ieUA,
				expectedContentType: 'image/vnd.ms-photo',
				expectedFtImageFormat: 'jpegxr'
			},
		].forEach(({accept, userAgent, expectedContentType, expectedFtImageFormat}) => {
			describe(`when the 'user-agent' header is ${userAgent} and the 'accepts' header is ${accept}`, function() {
				setupRequest(
                    'GET',
                    `/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service&format=auto`,
                    {
                        accept: accept,
                        'user-agent': userAgent,
                    }
                );
				itRespondsWithHeader('Content-Type', expectedContentType);
				itRespondsWithHeader('FT-Image-Format', expectedFtImageFormat);
			});
		});
	});

	context('when an image is returned, surrogate keys are added', function() {
		describe('adds generic key for all image requests:', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			onlyRunOnExternalServer('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			onlyRunOnExternalServer('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			onlyRunOnExternalServer('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			onlyRunOnExternalServer('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});
		});

		describe('adds specific keys for image content types', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			onlyRunOnExternalServer('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			onlyRunOnExternalServer('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			onlyRunOnExternalServer('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			onlyRunOnExternalServer('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});
		});

		describe('adds specific keys for image schemes', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRicmFuZA==/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			onlyRunOnExternalServer('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRmbGFn/);
			});

			onlyRunOnExternalServer('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRpY29u/);
			});

			onlyRunOnExternalServer('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRsb2dv/);
			});

			onlyRunOnExternalServer('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRzb2NpYWw=/);
			});

			describe('httpftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('httpsftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aHR0cDo=/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.https}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aHR0cHM6Ly9vcmlnYW1pL/);
			});

			describe('protocolRelativeftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelative}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aHR0cA==/);
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /c3BlY2lhbGlzdHRpdGxl/);
			});
		});

		describe('adds key for specific image requested', function() {
			onlyRunOnExternalServer('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRicmFuZC12MTpicmFuZC1mdC1tb25leQ/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6NmM1YTJmOGMtMThjYS00YWZhLTgwZmYtN2Q1NmU0MTE3MmIx/);
			});

			onlyRunOnExternalServer('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRmbGFnOmpw/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRoZWFkLXYx/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRpY29uOmNyb3Nz/);
			});

			onlyRunOnExternalServer('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRsb2dvOmJyYW5kLWZ0/);
			});

			onlyRunOnExternalServer('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRzb2NpYWw6d2hhdHNhcHA=/);
			});

			describe('httpftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
			});

			describe('httpsftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aHR0cDovL29yaWdhbWkta/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.https}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aHR0cHM6Ly9vcmlnYW1pL/);
			});

			describe('protocolRelativeftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelative}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /Ly9vcmlnYW1pLWltYWdl/);
			});

			onlyRunOnExternalServer('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /c3BlY2lhbGlzdHRpdGxlOm5lZC1sb2dv/);
			});

			describe('nonUtf8Characters', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.nonUtf8Characters}?source=origami-image-service`);
				itRespondsWithHeader('surrogate-key', /aHR0cHM6Ly9vcmlnYW1pLWltYWdlLXNlcnZpY2UtaW50ZWdyYXRpb24tdGVzdHMuczMtZXUtd2VzdC0xLmFtYXpvbmF3cy5jb20vQmVhdXRlzIEuanBn/);
			});
		});
	});
});
