'use strict';

const sinon = require('sinon');

const morgan = module.exports = sinon.stub();
const mockMiddleware = module.exports.mockMiddleware = sinon.stub();

morgan.returns(mockMiddleware);
