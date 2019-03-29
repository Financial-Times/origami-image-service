'use strict';

const sinon = require('sinon');


const fastlyPurge = module.exports = sinon.stub();

const mockInstance = module.exports.mockInstance = {
	url: sinon.stub(),
	key: sinon.stub()
};

fastlyPurge.returns(mockInstance);
