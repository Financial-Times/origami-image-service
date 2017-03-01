'use strict';

const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itDoesNotRespondWithHeader = require('../helpers/it-does-not-respond-with-header');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const testImageUris = {
	ftbrand: 'ftbrand:brussels-blog',
	ftcms: 'ftcms:6c5a2f8c-18ca-4afa-80ff-7d56e41172b1',
	fthead: 'fthead:martin-wolf',
	fticon: 'fticon:cross',
	ftlogo: 'ftlogo:brand-ft',
	ftpodcast: 'ftpodcast:arts',
	ftsocial: 'ftsocial:whatsapp',
	httpftcms: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcms: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpftcmsmalformed: 'http:/im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcmsmalformed: 'https:im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	http: 'http://assets1.howtospendit.ft-static.com/images/06/cf/71/06cf7131-fd60-43b8-813a-a296acd81561_main_crop.jpg',
	https: 'https://assets1.howtospendit.ft-static.com/images/06/cf/71/06cf7131-fd60-43b8-813a-a296acd81561_main_crop.jpg',
	protocolRelative: '//assets1.howtospendit.ft-static.com/images/06/cf/71/06cf7131-fd60-43b8-813a-a296acd81561_main_crop.jpg',
	protocolRelativeftcms: '//im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	specialisttitle: 'specialisttitle:ned-logo'
};

describe('GET /v2/images/raw…', function() {

	describe('/http://… (HTTP scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https://… (HTTPS scheme unencoded)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
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

	describe('/http:/… (HTTP scheme unencoded malformed)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcmsmalformed}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/https:… (HTTPS scheme unencoded malformed)', function() {
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
		itRespondsWithContentType('image/png');
	});

	describe('/ftbrand:… (ftbrand scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/png');
	});

	describe('/ftcms:… (ftcms scheme)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
	});

	describe('/ftcms:… (ftcms scheme with querystring)', function() {
		setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}%3Ffoo%3Dbar?source=test`);
		itRespondsWithStatus(200);
		itRespondsWithContentType('image/jpeg');
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
		itRespondsWithContentType('image/png');
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
		setupRequest('GET', `/v2/images/raw/fthead-v1:notahead?source=test`);
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when a CMS image is not found', function() {
		setupRequest('GET', `/v2/images/raw/ftcms:notanid?source=test`);
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an HTTP image is not found', function() {
		setupRequest('GET', `/v2/images/raw/https://www.ft.com/notapage?source=test`);
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');
	});

	describe('when an image responds with HTML', function() {
		setupRequest('GET', `/v2/images/raw/https://www.ft.com/?source=test`);
		itRespondsWithStatus(400);
		itRespondsWithContentType('text/html');
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
				itRespondsWithHeader('surrogate-key', /image\/png/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/jpeg/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/png/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/svg\+xml/);
			});

			describe('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/svg\+xml/);
			});

			describe('ftpodcast', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/png/);
			});

			describe('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/svg\+xml/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/jpeg/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/jpeg/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/jpeg/);
			});

			describe('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
				itRespondsWithHeader('surrogate-key', /image\/svg\+xml/);
			});
		});

		describe('adds specific keys for image schemes', function() {
			describe('ftbrand', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftbrand}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftbrand/);
			});

			describe('ftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftcms/);
			});

			describe('fthead', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fthead}?source=test`);
				itRespondsWithHeader('surrogate-key', /fthead/);
			});

			describe('fticon', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.fticon}?source=test`);
				itRespondsWithHeader('surrogate-key', /fticon/);
			});

			describe('ftlogo', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftlogo}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftlogo/);
			});

			describe('ftpodcast', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftpodcast}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftpodcast/);
			});

			describe('ftsocial', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.ftsocial}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftsocial/);
			});

			describe('httpftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftcms/);
			});

			describe('httpsftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.httpsftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftcms/);
			});

			describe('http', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.http}?source=test`);
				itRespondsWithHeader('surrogate-key', /http/);
			});

			describe('https', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.https}?source=test`);
				itRespondsWithHeader('surrogate-key', /https/);
			});

			describe('protocolRelativeftcms', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelativeftcms}?source=test`);
				itRespondsWithHeader('surrogate-key', /ftcms/);
			});

			describe('protocolRelative', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.protocolRelative}?source=test`);
				itRespondsWithHeader('surrogate-key', /http/);
			});

			describe('specialisttitle', function() {
				setupRequest('GET', `/v2/images/raw/${testImageUris.specialisttitle}?source=test`);
				itRespondsWithHeader('surrogate-key', /specialisttitle/);
			});
		});
	});
});
