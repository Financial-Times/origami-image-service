'use strict';

const itRespondsWithHeader = require('../helpers/it-responds-with-header');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

describe('GET /v1/', function() {
	setupRequest('GET', '/v1/');
	itRespondsWithStatus(301);
	itRespondsWithHeader('Location', 'https://image.webservices.ft.com/v1/');
});

describe('GET /v1/images/raw/fticon:cross?source=test', function() {
	setupRequest('GET', '/v1/images/raw/fticon:cross?source=test');
	itRespondsWithStatus(301);
	itRespondsWithHeader('Location', 'https://image.webservices.ft.com/v1/images/raw/fticon:cross?source=test');
});
