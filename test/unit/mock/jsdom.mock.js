'use strict';

const sinon = require('sinon');

module.exports = {
	JSDOM: sinon.stub(),
	mockJSDom: {
		window: {
			isMockWindow: true
		}
	}
};

module.exports.JSDOM.returns(module.exports.mockJSDom);
