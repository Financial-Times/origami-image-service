'use strict';

const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('GET /', function() {
	setupRequest('GET', '/');
	itRespondsWithStatus(301);
	itRespondsWithHeader('Location', '/__origami/service/image/v2/');
});

describe('GET /__origami/service/image/v1/', function() {
	setupRequest('GET', '/__origami/service/image/v1/');
	itRespondsWithStatus(301);
	itRespondsWithHeader('Location', '/__origami/service/image/v2/');
});

describe('GET /__origami/service/image/v1/images/raw/fticon:cross?source=origami-image-service', function() {
	setupRequest('GET', '/__origami/service/image/v1/images/raw/fticon:cross?source=origami-image-service');
	itRespondsWithStatus(301);
	itRespondsWithHeader('Location', '/__origami/service/image/v2/images/raw/fticon:cross?source=origami-image-service');
});
