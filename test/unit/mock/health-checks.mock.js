'use strict';

const sinon = require('sinon');

const HealthChecks = module.exports = sinon.stub();

const mockHealthChecks = module.exports.mockHealthChecks = {
	getFunction: sinon.stub(),
	getGoodToGoFunction: sinon.stub()
};

const mockFunction = module.exports.mockFunction = sinon.spy();
const mockGoodToGoFunction = module.exports.mockGoodToGoFunction = sinon.spy();

HealthChecks.returns(mockHealthChecks);
mockHealthChecks.getFunction.returns(mockFunction);
mockHealthChecks.getGoodToGoFunction.returns(mockGoodToGoFunction);
