

const sinon = require('sinon');

const SvgTintStream = module.exports = sinon.stub();

const mockStream = module.exports.mockStream = {};

SvgTintStream.returns(mockStream);
