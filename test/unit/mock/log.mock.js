'use strict';

const sinon = require('sinon');

module.exports = {
	error: sinon.spy(),
	info: sinon.spy(),
	warn: sinon.spy()
};
