

const assert = require('proclaim');
const getColorPair = require('../../../lib/get-color-pair');
const contrast = require('color-contrast');

describe('lib/get-color-pair', () => {
	describe('.pairs', () => {
		for (const [foreground, background] of getColorPair.pairs) {
			describe(`${foreground} on ${background}`, () => {
				it('is a high enough contrast', () => {
					// We're doing a bold, quite large font.
					// Aiming for a bit above AA.
					const HIGH_ENOUGH_CONTRAST = 5;
					assert.greaterThan(
						contrast(foreground, background),
						HIGH_ENOUGH_CONTRAST
					);
				});
			});
		}
	});
	describe('getColorPair()', () => {
		it('returns one of the pairs', () => {
			assert(getColorPair.pairs.includes(getColorPair()));
		});
	});
});
