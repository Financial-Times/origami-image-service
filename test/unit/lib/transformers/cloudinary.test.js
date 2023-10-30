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

		it('returns a Cloudinary upload URL', () => {
			assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
		});

		describe('when `transform` has a `width` property', () => {

			beforeEach(() => {
				transform.setWidth(123);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72,w_123/http://example.com/$'));
			});

		});

		describe('when `transform` has a `height` property', () => {

			beforeEach(() => {
				transform.setHeight(123);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,h_123,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `dpr` property', () => {

			beforeEach(() => {
				transform.setDpr(2);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,dpr_2,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `contain`', () => {

			beforeEach(() => {
				transform.setFit('contain');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fit,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `cover`', () => {

			beforeEach(() => {
				transform.setFit('cover');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `fill`', () => {

			beforeEach(() => {
				transform.setFit('fill');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_scale,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `fit` property set to `scale-down`', () => {

			beforeEach(() => {
				transform.setFit('scale-down');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_limit,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `gravity` property set to `faces`', () => {

			beforeEach(() => {
				transform.setGravity('faces');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,g_auto:faces,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `gravity` property set to `poi`', () => {

			beforeEach(() => {
				transform.setGravity('poi');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,g_auto:no_faces,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `format` property', () => {

			beforeEach(() => {
				transform.setFormat('png');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_png,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `quality` property', () => {

			beforeEach(() => {
				transform.setQuality('lowest');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_30/http://example.com/$'));
			});

		});

		describe('when `transform` has a `bgcolor` property', () => {

			beforeEach(() => {
				transform.setBgcolor('ff0000');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/b_rgb:ff0000,c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `tint` property with one color', () => {

			beforeEach(() => {
				transform.setTint('f00');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,e_tint:100:ff0000,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has a `tint` property with two colors', () => {

			beforeEach(() => {
				transform.setTint('f00,0f0');
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,e_tint:100:ff0000:00ff00,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` has an `immutable` property', () => {

			beforeEach(() => {
				transform.setImmutable(true);
				cloudinaryUrl = cloudinaryTransform(transform, options);
			});

			it('returns the expected Cloudinary upload URL', () => {
				assert.match(cloudinaryUrl, new RegExp('^https://res.cloudinary.com/testaccount/image/upload/s--[^/]+--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive.immutable_cache,q_72/http://example.com/$'));
			});

		});

		describe('when `transform` is not an instance of ImageTransform', () => {

			it('throws an error', () => {
				assert.throws(() => cloudinaryTransform('foo'), 'Invalid transform argument, expected an ImageTransform object');
			});

		});



	describe('Overlay functionality', () => {
		beforeEach(() => {
			ImageTransform = require('../../../../lib/image-transform');
			cloudinaryTransform = require('../../../../lib/transformers/cloudinary');
		});
		it('should handle overlay correctly', () => {

			const transform = new ImageTransform({ uri: 'http://example.com' });

			transform.setOverlay('http://overlay.com/');
			transform.setName('5032c0754b4756b34aabc2383dbf5eef5e8d73ab5d10b74c9ee067b1879efd52');
			const options = {
				cloudinaryAccountName: 'testaccount',
				cloudinaryApiKey: 'api-key',
				cloudinaryApiSecret: 'api-secret'
			};
			const cloudinaryUrl = cloudinaryTransform(transform, options);

			assert.equal(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/upload/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/l_fetch:aHR0cDovL292ZXJsYXkuY29tLw/c_scale,fl_relative/fl_layer_apply.no_overflow/5032c0754b4756b34aabc2383dbf5eef5e8d73ab5d10b74c9ee067b1879efd52');

		});

		it('should handle all overlay properties correctly', () => {

			const transform = new ImageTransform({ uri: 'http://example.com' });
			transform.setOverlay('http://overlay.com/');
			transform.setName('5032c0754b4756b34aabc2383dbf5eef5e8d73ab5d10b74c9ee067b1879efd52');
			transform.setOverlayX('30');
			transform.setOverlayY('40');
			transform.setOverlayGravity('north_west');
			transform.setOverlayWidth('150');
			transform.setOverlayHeight('50');

			const options = {
				cloudinaryAccountName: 'testaccount',
				cloudinaryApiKey: 'api-key',
				cloudinaryApiSecret: 'api-secret'
			};
			const cloudinaryUrl = cloudinaryTransform(transform, options);

			assert.equal(cloudinaryUrl, 'http://res.cloudinary.com/testaccount/image/upload/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/l_fetch:aHR0cDovL292ZXJsYXkuY29tLw/c_scale,fl_relative,h_50,w_150/fl_layer_apply.no_overflow,g_north_west,x_30,y_40/5032c0754b4756b34aabc2383dbf5eef5e8d73ab5d10b74c9ee067b1879efd52');

		});

		it('should not include overlay transforms if overlay is not set', () => {
			const transform = new ImageTransform({});
			transform.setOverlay(null);
			transform.setName('5032c0754b4756b34aabc2383dbf5eef5e8d73ab5d10b74c9ee067b1879efd52');
			const options = {
				cloudinaryAccountName: 'testaccount',
				cloudinaryApiKey: 'api-key',
				cloudinaryApiSecret: 'api-secret'
			};
			const cloudinaryUrl = cloudinaryTransform(transform, options);

			assert.equal(cloudinaryUrl, 'https://res.cloudinary.com/testaccount/image/upload/s--9OIPtX6Y--/c_fill,f_auto,fl_lossy.any_format.force_strip.progressive,q_72/5032c0754b4756b34aabc2383dbf5eef5e8d73ab5d10b74c9ee067b1879efd52');

		});
	});

	});

});
