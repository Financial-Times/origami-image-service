'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const express = module.exports = sinon.stub();

const mockApp = module.exports.mockApp = {
	disable: sinon.stub(),
	enable: sinon.stub(),
	get: sinon.stub(),
	listen: sinon.stub(),
	locals: {},
	set: sinon.stub(),
	use: sinon.stub()
};

const mockServer = module.exports.mockServer = {};

const mockStaticMiddleware = module.exports.mockStaticMiddleware = {};

module.exports.mockRequest = {
	headers: {},
	query: {},
	params: {}
};

module.exports.mockResponse = {
	app: mockApp,
	locals: {},
	redirect: sinon.stub().returnsThis(),
	render: sinon.stub().returnsThis(),
	send: sinon.stub().returnsThis(),
	set: sinon.stub().returnsThis(),
	status: sinon.stub().returnsThis()
};

mockApp.listen.resolves(mockServer);
express.returns(mockApp);
express.static = sinon.stub().returns(mockStaticMiddleware);
