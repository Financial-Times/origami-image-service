'use strict';

const sinon = require('sinon');

const httpProxy = module.exports = {
	createProxyServer: sinon.stub()
};

const mockProxyServer = module.exports.mockProxyServer = {
	on: sinon.stub(),
	web: sinon.stub()
};

module.exports.mockProxyRequest = {
	setHeader: sinon.spy()
};

module.exports.mockProxyResponse = {
	headers: {}
};

httpProxy.createProxyServer.returns(mockProxyServer);
