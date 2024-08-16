

const sinon = require('sinon');

const request = module.exports = sinon.stub();

const mockStream = module.exports.mockStream = {
	emit: sinon.stub().returnsThis(),
	on: sinon.stub().returnsThis(),
	pipe: sinon.stub().returnsThis()
};

request.returns(mockStream);
