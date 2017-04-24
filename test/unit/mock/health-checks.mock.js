'use strict';

const sinon = require('sinon');

const HealthChecks = module.exports = sinon.stub();

const mockHealthChecks = module.exports.mockHealthChecks = {
	checks: sinon.stub(),
	gtg: sinon.stub()
};

const mockChecksFunction = module.exports.mockChecksFunction = sinon.spy();
const mockGtgFunction = module.exports.mockGtgFunction = sinon.spy();

HealthChecks.returns(mockHealthChecks);
mockHealthChecks.checks.returns(mockChecksFunction);
mockHealthChecks.gtg.returns(mockGtgFunction);
