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

const mockRouter = module.exports.mockRouter = {};

const mockStaticMiddleware = module.exports.mockStaticMiddleware = {};

module.exports.mockRequest = {
	headers: {},
	query: {},
	params: {}
};

module.exports.mockResponse = {
	app: mockApp,
	render: sinon.stub().returnsThis(),
	send: sinon.stub().returnsThis(),
	set: sinon.stub().returnsThis(),
	status: sinon.stub().returnsThis()
};

mockApp.listen.resolves(mockServer);
express.returns(mockApp);
express.Router = sinon.stub().returns(mockRouter);
express.static = sinon.stub().returns(mockStaticMiddleware);
