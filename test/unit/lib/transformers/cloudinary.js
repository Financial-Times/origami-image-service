'use strict';

const assert = require('chai').assert;

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
				cloudinaryAccountName: 'testaccount'
			};
			cloudinaryUrl = cloudinaryTransform(transform, options);
		});

		it('returns a Cloudinary fetch URL', () => {
			assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,f_auto,q_72/http://example.com/');
		});

		describe('when `transform` has a `width` property', () => {

			beforeEach(() => {
				transform.setWidth(123);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,f_auto,q_72,w_123/http://example.com/');
			});

		});

		describe('when `transform` has a `height` property', () => {

			beforeEach(() => {
				transform.setHeight(123);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,f_auto,h_123,q_72/http://example.com/');
			});

		});

		describe('when `transform` has a `dpr` property', () => {

			beforeEach(() => {
				transform.setDpr(2);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,dpr_2,f_auto,q_72/http://example.com/');
			});

		});

		describe('when `transform` has a `fit` property set to `contain`', () => {

			beforeEach(() => {
				transform.setFit('contain');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fit,f_auto,q_72/http://example.com/');
			});

		});

		describe('when `transform` has a `fit` property set to `cover`', () => {

			beforeEach(() => {
				transform.setFit('cover');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,f_auto,q_72/http://example.com/');
			});

		});

		describe('when `transform` has a `fit` property set to `scale-down`', () => {

			beforeEach(() => {
				transform.setFit('scale-down');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_limit,f_auto,q_72/http://example.com/');
			});

		});

		describe('when `transform` has a `format` property', () => {

			beforeEach(() => {
				transform.setFormat('png');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,f_png,q_72/http://example.com/');
			});

		});

		describe('when `transform` has a `quality` property', () => {

			beforeEach(() => {
				transform.setQuality('lowest');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/c_fill,f_auto,q_30/http://example.com/');
			});

		});

		describe('when `transform` has a `bgcolor` property', () => {

			beforeEach(() => {
				transform.setBgcolor('ff0000');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary fetch URL', () => {
				assert.strictEqual(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/fetch/b_rgb:ff0000,c_fill,f_auto,q_72/http://example.com/');
			});

		});

		describe('when `transform` is not an instance of ImageTransform', () => {

			it('throws an error', () => {
				assert.throws(() => cloudinaryTransform('foo'), 'Invalid transform argument, expected an ImageTransform object');
			});

		});

	});

});
