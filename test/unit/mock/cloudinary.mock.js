'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = {
	config: sinon.stub(),
	url: sinon.stub(),
	uploader: {
		destroy: sinon.stub().resolves()
	}
};
