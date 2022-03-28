'use strict';

const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('GET /v2/', function() {

	setupRequest('GET', '/v2/');
	itRespondsWithStatus(200);
	itRespondsWithContentType('text/html');
});

describe('GET /__origami/service/image/v2/', function() {

	setupRequest('GET', '/__origami/service/image/v2/');
	itRespondsWithStatus(200);
	itRespondsWithContentType('text/html');
});
