'use strict';

const sinon = require('sinon');

module.exports = {
	v2: {
		api: {
			usage: sinon.stub().resolves()
		},
		config: sinon.stub(),
		url: sinon.stub(),
		uploader: {
			destroy: sinon.stub().resolves()
		}
	}
};
