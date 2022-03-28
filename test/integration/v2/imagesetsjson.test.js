'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('Origami Image Sets JSON API', function () {
    describe('ftbrand', function () {
        setupRequest('GET', '/v2/imagesets/ftbrand?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftbrand-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftbrand-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
        describe('ftflag', function () {
            setupRequest('GET', '/v2/imagesets/ftflag?source=origami-image-service');
            itRespondsWithStatus(200);
            itRespondsWithContentType('application/json; charset=utf-8');
            itRespondsWithHeader('surrogate-key', /origami-image-service/);
        });
        describe('ftflag-v1', function () {
            setupRequest('GET', '/v2/imagesets/ftflag-v1?source=origami-image-service');
            itRespondsWithStatus(200);
            itRespondsWithContentType('application/json; charset=utf-8');
            itRespondsWithHeader('surrogate-key', /origami-image-service/);
        });
    describe('fticon', function () {
        setupRequest('GET', '/v2/imagesets/fticon?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('fticon-v1', function () {
        setupRequest('GET', '/v2/imagesets/fticon-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftlogo', function () {
        setupRequest('GET', '/v2/imagesets/ftlogo?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftlogo-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftlogo-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftpodcast', function () {
        setupRequest('GET', '/v2/imagesets/ftpodcast?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftpodcast-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftpodcast-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftsocial', function () {
        setupRequest('GET', '/v2/imagesets/ftsocial?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftsocial-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftsocial-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftsocial-v2', function () {
        setupRequest('GET', '/v2/imagesets/ftsocial-v2?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('specialisttitle', function () {
        setupRequest('GET', '/v2/imagesets/specialisttitle?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('specialisttitle-v1', function () {
        setupRequest('GET', '/v2/imagesets/specialisttitle-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
});

describe('Origami Image Sets JSON API', function () {
    describe('ftbrand', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftbrand?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftbrand-v1', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftbrand-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
        describe('ftflag', function () {
            setupRequest('GET', '/__origami/service/image/v2/imagesets/ftflag?source=origami-image-service');
            itRespondsWithStatus(200);
            itRespondsWithContentType('application/json; charset=utf-8');
            itRespondsWithHeader('surrogate-key', /origami-image-service/);
        });
        describe('ftflag-v1', function () {
            setupRequest('GET', '/__origami/service/image/v2/imagesets/ftflag-v1?source=origami-image-service');
            itRespondsWithStatus(200);
            itRespondsWithContentType('application/json; charset=utf-8');
            itRespondsWithHeader('surrogate-key', /origami-image-service/);
        });
    describe('fticon', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/fticon?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('fticon-v1', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/fticon-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftlogo', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftlogo?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftlogo-v1', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftlogo-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftpodcast', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftpodcast?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftpodcast-v1', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftpodcast-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftsocial', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftsocial?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftsocial-v1', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftsocial-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('ftsocial-v2', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/ftsocial-v2?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('specialisttitle', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/specialisttitle?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
    describe('specialisttitle-v1', function () {
        setupRequest('GET', '/__origami/service/image/v2/imagesets/specialisttitle-v1?source=origami-image-service');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
        itRespondsWithHeader('surrogate-key', /origami-image-service/);
    });
});
