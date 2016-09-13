'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const express = module.exports = sinon.stub();

const mockApp = module.exports.mockApp = {
	disable: sinon.stub(),
	enable: sinon.stub(),
	get: sinon.stub(),
	listen: sinon.stub(),
	set: sinon.stub(),
	use: sinon.stub()
};

const mockServer = module.exports.mockServer = {};

module.exports.mockRequest = {
	query: {},
	params: {}
};

module.exports.mockResponse = {
	render: sinon.stub().returnsThis(),
	send: sinon.stub().returnsThis(),
	set: sinon.stub().returnsThis(),
	status: sinon.stub().returnsThis()
};

mockApp.listen.resolves(mockServer);
express.returns(mockApp);
