'use strict';

const assert = require('proclaim');

describe('lib/transformers/cloudinary', () => {
	let cloudinaryTransform;
	let ImageTransform;

	beforeEach(() => {
		ImageTransform = require('../../../../lib/image-transform');
		cloudinaryTransform = require('../../../../lib/transformers/cloudinary');
	});

	it('exports a function', () => {
		assert.isFunction(cloudinaryTransform);
	});

	describe('cloudinaryTransform(transform, options)', () => {
		let cloudinaryUrl;
		let options;
		let transform;

		beforeEach(() => {
			transform = new ImageTransform({
				uri: 'http://example.com/'
			});
			options = {
				cloudinaryAccountName: 'testaccount',
				cloudinaryApiKey: 'api-key',
				cloudinaryApiSecret: 'api-secret'
			};
			cloudinaryUrl = cloudinaryTransform(transform, options);
		});

		it('returns a Cloudinary fetch URL', () => {
			assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
		});

		describe('when `transform` has a `width` property', () => {

			beforeEach(() => {
				transform.setWidth(123);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,q_72,w_123/http://example.com/$'));
			});

		});

		describe('when `transform` has a `height` property', () => {

			beforeEach(() => {
				transform.setHeight(123);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,h_123,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `dpr` property', () => {

			beforeEach(() => {
				transform.setDpr(2);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,dpr_2,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `contain`', () => {

			beforeEach(() => {
				transform.setFit('contain');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fit,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `cover`', () => {

			beforeEach(() => {
				transform.setFit('cover');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `scale-down`', () => {

			beforeEach(() => {
				transform.setFit('scale-down');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_limit,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `gravity` property set to `faces`', () => {

			beforeEach(() => {
				transform.setGravity('faces');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,g_auto:faces,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `gravity` property set to `poi`', () => {

			beforeEach(() => {
				transform.setGravity('poi');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,g_auto:no_faces,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `format` property', () => {

			beforeEach(() => {
				transform.setFormat('png');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_png,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `quality` property', () => {

			beforeEach(() => {
				transform.setQuality('lowest');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,f_auto,fl_any_format.force_strip.progressive,q_30/http://example.com/$'));
			});

		});

		describe('when `transform` has a `bgcolor` property', () => {

			beforeEach(() => {
				transform.setBgcolor('ff0000');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/b_rgb:ff0000,c_fill,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `tint` property with one color', () => {

			beforeEach(() => {
				transform.setTint('f00');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,e_tint:100:ff0000,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `tint` property with two colors', () => {

			beforeEach(() => {
				transform.setTint('f00,0f0');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/fetch/s--[^/]+--/c_fill,e_tint:100:ff0000:00ff00,f_auto,fl_any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` is not an instance of ImageTransform', () => {

			it('throws an error', () => {
				assert.throws(() => cloudinaryTransform('foo'), 'Invalid transform argument, expected an ImageTransform object');
			});

		});

	});

});
