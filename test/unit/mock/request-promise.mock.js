'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const requestPromise = module.exports = sinon.stub().resolves();
