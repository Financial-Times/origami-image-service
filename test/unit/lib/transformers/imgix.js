'use strict';

const assert = require('chai').assert;

describe('lib/transformers/imgix', () => {
	let imgixTransform;
	let ImageTransform;

	beforeEach(() => {
		ImageTransform = require('../../../../lib/image-transform');
		imgixTransform = require('../../../../lib/transformers/imgix');
	});

	it('exports a function', () => {
		assert.isFunction(imgixTransform);
	});

	describe('imgixTransform(transform, options)', () => {
		let imgixUrl;
		let options;
		let transform;

		beforeEach(() => {
			transform = new ImageTransform({
				uri: 'http://example.com/'
			});
			options = {
				imgixSourceName: 'foo-source'
			};
			imgixUrl = imgixTransform(transform, options);
		});

		it('returns an Imgix fetch URL', () => {
			assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop');
		});

		describe('when `transform` has a `width` property', () => {

			beforeEach(() => {
				transform.setWidth(123);
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop&w=123');
			});

		});

		describe('when `transform` has a `height` property', () => {

			beforeEach(() => {
				transform.setHeight(123);
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop&h=123');
			});

		});

		describe('when `transform` has a `dpr` property', () => {

			beforeEach(() => {
				transform.setWidth(200);
				transform.setHeight(200);
				transform.setDpr(2, transform.getWidth(), transform.getHeight());
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, `https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop&w=${transform.getWidth()}&h=${transform.getHeight()}&dpr=2`);
			});

			it('should not fail when a decimal width or height is set', () => {
				transform.setWidth(201);
				transform.setHeight(201);
				transform.setDpr(2, transform.getWidth(), transform.getHeight());
				imgixUrl = imgixTransform(transform, options);
				assert.strictEqual(imgixUrl, `https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop&w=${transform.getWidth()}&h=${transform.getHeight()}&dpr=2`);
			});
		});

		describe('when `transform` has a `fit` property set to `contain`', () => {

			beforeEach(() => {
				transform.setFit('contain');
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=clip');
			});

		});

		describe('when `transform` has a `fit` property set to `cover`', () => {

			beforeEach(() => {
				transform.setFit('cover');
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop');
			});

		});

		describe('when `transform` has a `fit` property set to `scale-down`', () => {

			beforeEach(() => {
				transform.setFit('scale-down');
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=max');
			});

		});

		describe('when `transform` has a `format` property', () => {

			beforeEach(() => {
				transform.setFormat('png');
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=png&quality=70&fit=crop');
			});

		});

		describe('when `transform` has a `quality` property', () => {

			beforeEach(() => {
				transform.setQuality('lowest');
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=30&fit=crop');
			});

		});

		describe('when `transform` has a `bgcolor` property', () => {

			beforeEach(() => {
				transform.setBgcolor('ff0000');
				imgixUrl = imgixTransform(transform, options);
			});

			it('returns the expected Imgix fetch URL', () => {
				assert.strictEqual(imgixUrl, 'https://foo-source.imgix.net/http%3A%2F%2Fexample.com%2F?fm=jpg&quality=70&fit=crop&bg=ff0000');
			});

		});

		describe('when `transform` is not an instance of ImageTransform', () => {

			it('throws an error', () => {
				assert.throws(() => imgixTransform('foo'), 'Invalid transform argument, expected an ImageTransform object');
			});

		});

	});

});
