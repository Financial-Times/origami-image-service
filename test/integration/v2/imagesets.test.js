'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const {
	ftbrand,
	ftflag,
	fticon,
	fticonV1,
	ftlogo,
	specialisttitle,
	ftpodcast,
	ftsocial,
	ftsocialV2,
} = require('../../../lib/imagesets');
const itRespondsWithHeader = require('../helpers/it-responds-with-header');

const usingExternalServer = Boolean(process.env.HOST);

const onlyRunOnExternalServer = usingExternalServer ? describe : describe.skip;

// These tests are not possible to run against a local server as the images need to be accessible to Cloudinary over the web
onlyRunOnExternalServer('Origami Image Sets via Custom Schemes', function () {
	describe('ftbrand', function () {
		for (const name of Object.keys(ftbrand)) {
			describe(`ftbrand:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftbrand:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftbrand-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftbrand-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftflag', function () {
		for (const name of Object.keys(ftflag)) {
			describe(`ftflag:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftflag:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftflag-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftflag-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('fticon', function () {
		for (const name of Object.keys(fticon)) {
			describe(`fticon:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/fticon:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
		for (const name of Object.keys(fticonV1)) {
			describe(`fticon-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/fticon-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftlogo', function () {
		for (const name of Object.keys(ftlogo)) {
			describe(`ftlogo:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftlogo:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftlogo-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftlogo-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftpodcast', function () {
		for (const name of Object.keys(ftpodcast)) {
			describe(`ftpodcast:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftpodcast:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftpodcast-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftpodcast-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftsocial', function () {
		for (const name of Object.keys(ftsocial)) {
			describe(`ftsocial:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftsocial:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftsocial-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftsocial-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
		for (const name of Object.keys(ftsocialV2)) {
			describe(`ftsocial-v2:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/ftsocial-v2:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('specialisttitle', function () {
		for (const name of Object.keys(specialisttitle)) {
			describe(`specialisttitle:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/specialisttitle:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`specialisttitle-v1:${name}`, function () {
				setupRequest('GET', `/v2/images/raw/specialisttitle-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});

});

onlyRunOnExternalServer('Origami Image Sets via Custom Schemes', function () {
	describe('ftbrand', function () {
		for (const name of Object.keys(ftbrand)) {
			describe(`ftbrand:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftbrand:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftbrand-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftbrand-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftflag', function () {
		for (const name of Object.keys(ftflag)) {
			describe(`ftflag:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftflag:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftflag-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftflag-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('fticon', function () {
		for (const name of Object.keys(fticon)) {
			describe(`fticon:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/fticon:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
		for (const name of Object.keys(fticonV1)) {
			describe(`fticon-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/fticon-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftlogo', function () {
		for (const name of Object.keys(ftlogo)) {
			describe(`ftlogo:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftlogo:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftlogo-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftlogo-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftpodcast', function () {
		for (const name of Object.keys(ftpodcast)) {
			describe(`ftpodcast:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftpodcast:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftpodcast-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftpodcast-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('ftsocial', function () {
		for (const name of Object.keys(ftsocial)) {
			describe(`ftsocial:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftsocial:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`ftsocial-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftsocial-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
		for (const name of Object.keys(ftsocialV2)) {
			describe(`ftsocial-v2:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/ftsocial-v2:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});
	describe('specialisttitle', function () {
		for (const name of Object.keys(specialisttitle)) {
			describe(`specialisttitle:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/specialisttitle:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
			describe(`specialisttitle-v1:${name}`, function () {
				setupRequest('GET', `/__origami/service/image/v2/images/raw/specialisttitle-v1:${name}?source=origami-image-service`);
				itRespondsWithStatus(200);
				itRespondsWithHeader('surrogate-key', /origami-image-service/);
				itRespondsWithHeader('Timing-Allow-Origin', '*');
				itRespondsWithHeader('FT-Suppress-Friendly-Error', 'true');
				itRespondsWithContentType('image/*');
			});
		}
	});

});
