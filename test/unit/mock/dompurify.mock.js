'use strict';

const sinon = require('sinon');

const createDomPurify = module.exports = sinon.stub();

const mockDomPurify = module.exports.mockDomPurify = {
	sanitize: sinon.stub().returns('mock-purified-svg')
};

createDomPurify.returns(mockDomPurify);
