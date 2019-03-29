'use strict';

const sinon = require('sinon');


const purgeFastly = module.exports = sinon.stub();

const mockInstance = module.exports.mockInstance = sinon.stub();

purgeFastly.returns(mockInstance);
