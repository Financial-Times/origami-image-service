'use strict';

const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itDoesNotRespondWithHeader = require('../helpers/it-does-not-respond-with-header');
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
	httpftcms: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcms: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpftcmsmalformed: 'http:/im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcmsmalformed: 'https:im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	http: 'http://origami-images.ft.com/ftsocial/v1/twitter.svg',
	httpmalformed: 'http:/origami-images.ft.com/ftsocial/v1/twitter.svg',
	https: 'https://origami-images.ft.com/ftsocial/v1/twitter.svg',
	httpsmalformed: 'https:/origami-images.ft.com/ftsocial/v1/twitter.svg',
	protocolRelative: '//origami-images.ft.com/ftsocial/v1/twitter.svg',
	protocolRelativeftcms: '//im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	specialisttitle: 'specialisttitle:ned-logo',
	nonUtf8Characters: 'https://origami-image-service-integration-tests.s3-eu-west-1.amazonaws.com/Beaute%CC%81.jpg'
};

describe('GET /v2/images/raw…', function() {

	describe('/http://… (HTTP scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https://… (HTTPS scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.nonUtf8Characters}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http%3A%2F%2F… (HTTP scheme encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpftcms)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https%3A%2F%2F… (HTTPS scheme encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpsftcms)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http:/… (HTTP scheme url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpmalformed}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/https:… (HTTPS scheme url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsmalformed}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/http:/… (HTTP scheme with ftcms url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcmsmalformed}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https:… (HTTPS scheme with ftcms url unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcmsmalformed}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/http%3A%2F… (HTTP scheme encoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpftcmsmalformed)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https%3A… (HTTPS scheme encoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.httpsftcmsmalformed)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('///… (protocol-relative unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/2F%2F… (protocol-relative encoded)', function() {
		setupRequest('GET', `/v2/images/raw/${encodeURIComponent(testImageUris.protocolRelativeftcms)}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftbrand:… (ftbrand scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftbrand:… (ftbrand scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (ftcms scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (capiv1 scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.capiv1}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (capiv2 scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.capiv2}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (spark scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.spark}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (sparkMasterImage scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.sparkMasterImage}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https:… (httpsspark scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsspark}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (ftcms scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftflag:… (ftflag scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/ftflag:… (ftflag scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/fticon:… (fticon scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/fticon:… (fticon scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/fthead:… (fthead scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/fthead:… (fthead scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/ftsocial:… (ftsocial scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/ftpodcast:… (ftpodcast scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftlogo:… (ftlogo scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/specialisttitle:… (specialisttitle scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/svg+xml');
	});

	describe('/specialisttitle:… (specialisttitle scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}%3Ffoo%3Dbar?source=test`);
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

		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test&bgcolor=f0`);
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');

		it('responds with a descriptive error message', function(done) {
			this.request.expect(/image bgcolor must be a valid hex code or color name/i).end(done);
		});

	});

	describe('when a dpr is set', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test&dpr=2`);
		itRespondsWithHeader('content-Dpr', '2');
	});

	describe('when a dpr is not set', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
		itDoesNotRespondWithHeader('content-Dpr');
	});

	describe('when a custom scheme image is not found', function() {
		setupRequest('GET', '/v2/images/raw/fthead-v1:notahead?source=test');
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');
	});

	describe('when a CMS image is not found', function() {
		setupRequest('GET', '/v2/images/raw/ftcms:notanid?source=test');
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an HTTP image is not found', function() {
		setupRequest('GET', '/v2/images/raw/https://www.ft.com/notapage?source=test');
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an image responds with HTML', function() {
		setupRequest('GET', '/v2/images/raw/https://www.ft.com/?source=test');
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');
	});

	describe('when a request has no image specified', function() {
		setupRequest('GET', '/v2/images/raw/?source=test');
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an image starts with a spaces', function() {
		setupRequest('GET', `/v2/images/raw/%20%20%20%20${testImageUris.httpsftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('when an image ends with spaces', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}%20%20%20?source=test`);
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
                    `/v2/images/raw/${testImageUris.httpsftcms}?source=test&format=auto`,
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
			describe('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('ftpodcast', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});

			describe('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
			});
		});

		describe('adds specific keys for image content types', function() {
			describe('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvcG5n/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			describe('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			describe('ftpodcast', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2UvanBlZw==/);
			});

			describe('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
				itRespondsWithHeader('surrogate-key', /aW1hZ2Uvc3ZnK3htbA==/);
			});
		});

		describe('adds specific keys for image schemes', function() {
			describe('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRicmFuZA==/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRmbGFn/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRoZWFk/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRpY29u/);
			});

			describe('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRsb2dv/);
			});

			describe('ftpodcast', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRwb2RjYXN0/);
			});

			describe('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRzb2NpYWw=/);
			});

			describe('httpftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('httpsftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=test`);
				itRespondsWithHeader('surrogate-key', /aHR0cDo=/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.https}?source=test`);
				itRespondsWithHeader('surrogate-key', /aHR0cHM6Ly9vcmlnYW1pLWltYWdlcy5mdC5jb20vZnRzb2NpYWwvdjEvdHdpdHRlci5zdmc=/);
			});

			describe('protocolRelativeftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM=/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelative}?source=test`);
				itRespondsWithHeader('surrogate-key', /aHR0cA==/);
			});

			describe('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
				itRespondsWithHeader('surrogate-key', /c3BlY2lhbGlzdHRpdGxl/);
			});
		});

		describe('adds key for specific image requested', function() {
			describe('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRicmFuZDpicnVzc2Vscy1ibG9n/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6NmM1YTJmOGMtMThjYS00YWZhLTgwZmYtN2Q1NmU0MTE3MmIx/);
			});

			describe('ftflag', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftflag}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRmbGFnOmpw/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRoZWFkOm1hcnRpbi13b2xm/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRpY29uOmNyb3Nz/);
			});

			describe('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRsb2dvOmJyYW5kLWZ0/);
			});

			describe('ftpodcast', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRwb2RjYXN0OmFydHM=/);
			});

			describe('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRzb2NpYWw6d2hhdHNhcHA=/);
			});

			describe('httpftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
			});

			describe('httpsftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=test`);
				itRespondsWithHeader('surrogate-key', /aHR0cDovL29yaWdhbWktaW1hZ2VzLmZ0LmNvbS9mdHNvY2lhbC92MS90d2l0dGVyLnN2Zw==/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.https}?source=test`);
				itRespondsWithHeader('surrogate-key', /aHR0cHM6Ly9vcmlnYW1pLWltYWdlcy5mdC5jb20vZnRzb2NpYWwvdjEvdHdpdHRlci5zdmc=/);
			});

			describe('protocolRelativeftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ZnRjbXM6YTYwYWUyNGItYjg3Zi00MzljLWJmMWItNmU1NDk0NmI0Y2Yy/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelative}?source=test`);
				itRespondsWithHeader('surrogate-key', /Ly9vcmlnYW1pLWltYWdlcy5mdC5jb20vZnRzb2NpYWwvdjEvdHdpdHRlci5zdmc=/);
			});

			describe('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
				itRespondsWithHeader('surrogate-key', /c3BlY2lhbGlzdHRpdGxlOm5lZC1sb2dv/);
			});

			describe('nonUtf8Characters', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.nonUtf8Characters}?source=test`);
				itRespondsWithHeader('surrogate-key', /aHR0cHM6Ly9vcmlnYW1pLWltYWdlLXNlcnZpY2UtaW50ZWdyYXRpb24tdGVzdHMuczMtZXUtd2VzdC0xLmFtYXpvbmF3cy5jb20vQmVhdXRlzIEuanBn/);
			});
		});
	});
});
