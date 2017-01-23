'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const origamiService = module.exports = sinon.stub();

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

const mockBasePathMiddleware = module.exports.mockBasePathMiddleware = sinon.spy();
const mockErrorHandlerMiddleware = module.exports.mockErrorHandlerMiddleware = sinon.spy();
const mockNotFoundMiddleware = module.exports.mockNotFoundMiddleware = sinon.spy();
origamiService.middleware = {
	getBasePath: sinon.stub().returns(mockBasePathMiddleware),
	errorHandler: sinon.stub().returns(mockErrorHandlerMiddleware),
	notFound: sinon.stub().returns(mockNotFoundMiddleware)
};

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
origamiService.returns(mockApp);
