'use strict';

const colors = {
	black: '#000000',
	white: '#ffffff',
	paper: '#fff1e5',
	claret: '#990f3d',
	oxford: '#0f5499',
	teal: '#0d7680',
	velvet: '#593380',
	lemon: '#ffec1a',
	slate: '#262a33',
	candy: '#ff7faa',
	jade: '#00994d',
	ft: '#fcd0b1',
};

// foreground then background
// checked for good contrast on the o-colors contrast demo
const pairs = [
	[colors.white, colors.black],
	[colors.white, colors.claret],
	[colors.white, colors.oxford],
	[colors.white, colors.teal],
	[colors.white, colors.velvet],
	[colors.black, colors.white],
	[colors.black, colors.paper],
	[colors.black, colors.ft],
	[colors.black, colors.lemon],
	[colors.black, colors.jade],
	[colors.black, colors.candy],
	[colors.lemon, colors.slate],
];

function getColorPair() {
	return pairs[Math.floor(Math.random() * pairs.length)];
}

module.exports = getColorPair;
module.exports.pairs = pairs;
