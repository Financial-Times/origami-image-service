'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('Origami Image Sets JSON API', function () {
    describe('ftbrand', function () {
        setupRequest('GET', '/v2/imagesets/ftbrand?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftbrand-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftbrand-v1?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
        describe('ftflag', function () {
            setupRequest('GET', '/v2/imagesets/ftflag?source=test');
            itRespondsWithStatus(200);
            itRespondsWithContentType('application/json; charset=utf-8');
        });
        describe('ftflag-v1', function () {
            setupRequest('GET', '/v2/imagesets/ftflag-v1?source=test');
            itRespondsWithStatus(200);
            itRespondsWithContentType('application/json; charset=utf-8');
        });
    describe('fticon', function () {
        setupRequest('GET', '/v2/imagesets/fticon?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('fticon-v1', function () {
        setupRequest('GET', '/v2/imagesets/fticon-v1?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftlogo', function () {
        setupRequest('GET', '/v2/imagesets/ftlogo?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftlogo-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftlogo-v1?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftpodcast', function () {
        setupRequest('GET', '/v2/imagesets/ftpodcast?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftpodcast-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftpodcast-v1?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftsocial', function () {
        setupRequest('GET', '/v2/imagesets/ftsocial?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftsocial-v1', function () {
        setupRequest('GET', '/v2/imagesets/ftsocial-v1?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('ftsocial-v2', function () {
        setupRequest('GET', '/v2/imagesets/ftsocial-v2?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('specialisttitle', function () {
        setupRequest('GET', '/v2/imagesets/specialisttitle?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
    describe('specialisttitle-v1', function () {
        setupRequest('GET', '/v2/imagesets/specialisttitle-v1?source=test');
        itRespondsWithStatus(200);
        itRespondsWithContentType('application/json; charset=utf-8');
    });
});