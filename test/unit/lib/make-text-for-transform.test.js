'use strict';

const assert = require('proclaim');
const make = require('../../../lib/make-text-for-transform');

describe('lib/make-text-for-transform', () => {
	it('generates text containing the names and values', () => {
		assert.equal(make({
			quality: 100,
			width: 44
		}), `quality=100
width=44
`)
	});

	it('removes undefined and auto values', () => {
		assert.equal(make({
			quality: "auto",
			height: undefined,
			width: 700
		}), `width=700
`)
	});

	it('doesn\'t remove other falsy values', () => {
		assert.equal(make({
			quality: null,
			height: 0
		}), `quality=null
height=0
`)
	});

	it('removes uninteresting keys', () => {
		assert.equal(make({
			uri: "hello",
			name: "jimmy",
			fit: "district-9",
			quality: null,
			height: 0
		}), `quality=null
height=0
`)
	});
});
