'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = {
	api: {
		usage: sinon.stub().resolves()
	},
	config: sinon.stub(),
	url: sinon.stub(),
	uploader: {
		destroy: sinon.stub().resolves()
	}
};
