'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/image-transform', () => {
	let colornames;
	let ImageTransform;

	beforeEach(() => {
		colornames = sinon.stub();
		mockery.registerMock('colornames', colornames);

		ImageTransform = require('../../../lib/image-transform');
	});

	it('exports a function', () => {
		assert.isFunction(ImageTransform);
	});

	describe('new ImageTransform(properties)', () => {
		let instance;

		beforeEach(() => {
			instance = new ImageTransform({
				uri: 'http://example.com/'
			});
		});

		it('sets all of the expected properties', () => {
			const properties = {
				uri: 'http://example.com/',
				width: 123,
				height: 456,
				dpr: 2,
				fit: 'cover',
				gravity: 'poi',
				quality: 'lossless',
				format: 'jpg',
				bgcolor: '00ff00',
				tint: 'f00,00f'
			};
			instance = new ImageTransform(properties);
			assert.strictEqual(instance.getUri(), properties.uri);
			assert.strictEqual(instance.getWidth(), properties.width);
			assert.strictEqual(instance.getHeight(), properties.height);
			assert.strictEqual(instance.getDpr(), properties.dpr);
			assert.strictEqual(instance.getFit(), properties.fit);
			assert.strictEqual(instance.getGravity(), properties.gravity);
			assert.strictEqual(instance.getQuality(), ImageTransform.qualityValueMap[properties.quality]);
			assert.strictEqual(instance.getFormat(), properties.format);
			assert.strictEqual(instance.getBgcolor(), properties.bgcolor);
			assert.deepEqual(instance.getTint(), ['ff0000', '0000ff']);
		});

		describe('.setUri() / .getUri()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeUriValue').returns('sanitized');
				instance.setUri('http://foo/');
			});

			it('[set] calls the `sanitizeUriValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeUriValue);
				assert.calledWithExactly(ImageTransform.sanitizeUriValue, 'http://foo/', 'Image URI must be a string with a valid scheme');
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getUri(), 'sanitized');
			});

		});

		describe('.setWidth() / .getWidth()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeNumericValue').returns('sanitized');
				instance.setWidth(123);
			});

			it('[set] calls the `sanitizeNumericValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeNumericValue);
				assert.calledWithExactly(ImageTransform.sanitizeNumericValue, 123, 'Image width must be a positive whole number');
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getWidth(), 'sanitized');
			});

		});

		describe('.setHeight() / .getHeight()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeNumericValue').returns('sanitized');
				instance.setHeight(123);
			});

			it('[set] calls the `sanitizeNumericValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeNumericValue);
				assert.calledWithExactly(ImageTransform.sanitizeNumericValue, 123, 'Image height must be a positive whole number');
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getHeight(), 'sanitized');
			});

		});

		describe('.setDpr() / .getDpr()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeNumericValue').returns('sanitized');
				instance.setDpr(2);
			});

			it('[set] calls the `sanitizeNumericValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeNumericValue);
				assert.calledWithExactly(ImageTransform.sanitizeNumericValue, 2, 'Image DPR must be a positive whole number');
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getDpr(), 'sanitized');
			});

		});

		describe('.setFit() / .getFit()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeEnumerableValue').returns('sanitized');
				instance.setFit('foo');
			});

			it('[set] calls the `sanitizeEnumerableValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeEnumerableValue);
				assert.calledWithExactly(
					ImageTransform.sanitizeEnumerableValue,
					'foo',
					ImageTransform.validFits,
					`Image fit must be one of ${ImageTransform.validFits.join(', ')}`
				);
			});

			it('[set] defaults `value` to "cover"', () => {
				instance.setFit();
				assert.calledWith(ImageTransform.sanitizeEnumerableValue, 'cover');
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getFit(), 'sanitized');
			});

		});

		describe('.setGravity() / .getGravity()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeEnumerableValue').returns('sanitized');
				instance.setGravity('foo');
			});

			it('[set] calls the `sanitizeEnumerableValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeEnumerableValue);
				assert.calledWithExactly(
					ImageTransform.sanitizeEnumerableValue,
					'foo',
					ImageTransform.validGravities,
					`Image gravity must be one of ${ImageTransform.validGravities.join(', ')}`
				);
			});

			it('[set] defaults `value` to `undefined`', () => {
				instance.setGravity();
				assert.calledWith(ImageTransform.sanitizeEnumerableValue, undefined);
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getGravity(), 'sanitized');
			});

			describe('when `value` is defined and the `fit` property is not `cover`', () => {

				it('throws an error', () => {
					instance.fit = 'contain';
					assert.throws(() => instance.setGravity('foo'), 'Gravity can only be used when fit is set to "cover"');
				});

			});

		});

		describe('.setFormat() / .getFormat()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeEnumerableValue').returns('sanitized');
				instance.setFormat('foo');
			});

			it('[set] calls the `sanitizeEnumerableValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeEnumerableValue);
				assert.calledWithExactly(
					ImageTransform.sanitizeEnumerableValue,
					'foo',
					ImageTransform.validFormats,
					`Image format must be one of ${ImageTransform.validFormats.join(', ')}`
				);
			});

			it('[set] defaults `value` to "auto"', () => {
				instance.setFormat();
				assert.calledWith(ImageTransform.sanitizeEnumerableValue, 'auto');
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getFormat(), 'sanitized');
			});

			describe('when `value` is "auto" and the `quality` property is `lossless`', () => {

				beforeEach(() => {
					ImageTransform.sanitizeEnumerableValue.restore();
					instance.setQuality('lossless');
					instance.setFormat();
				});

				it('[get] returns "png"', () => {
					assert.strictEqual(instance.getFormat(), 'png');
				});

			});

		});

		describe('.setQuality() / .getQuality()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeEnumerableValue').returns('lossless');
				instance.setQuality('lossless');
			});

			it('[set] calls the `sanitizeEnumerableValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeEnumerableValue);
				assert.calledWithExactly(
					ImageTransform.sanitizeEnumerableValue,
					'lossless',
					ImageTransform.validQualities,
					`Image quality must be one of ${ImageTransform.validQualities.join(', ')}`
				);
			});

			it('[set] defaults `value` to "medium"', () => {
				instance.setQuality();
				assert.calledWith(ImageTransform.sanitizeEnumerableValue, 'medium');
			});

			it('[get] returns a numeric representation of the sanitized `value`', () => {
				assert.strictEqual(instance.getQuality(), 100);
			});

			describe('when `value` is valid and the `dpr` property is set', () => {

				beforeEach(() => {
					ImageTransform.sanitizeEnumerableValue.returns('medium');
					instance.setDpr(2);
					instance.setQuality('medium');
				});

				it('[get] returns a numeric representation of the sanitized `value` for images with higher DPRs', () => {
					assert.strictEqual(instance.getQuality(), 35);
				});

			});

		});

		describe('.setBgcolor() / .getBgcolor()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeColorValue').returns('sanitized');
				instance.setBgcolor('foo');
			});

			it('[set] calls the `sanitizeColorValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeColorValue);
				assert.calledWithExactly(
					ImageTransform.sanitizeColorValue,
					'foo',
					'Image bgcolor must be a valid hex code or color name'
				);
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getBgcolor(), 'sanitized');
			});

			describe('when `value` is valid and the `format` property is "png"', () => {

				it('[get] returns `undefined`', () => {
					instance.setFormat('png');
					instance.setBgcolor('foo');
					assert.isUndefined(instance.getBgcolor());
				});

			});

			describe('when `value` is valid and the `format` property is "svg"', () => {

				it('[get] returns `undefined`', () => {
					instance.setFormat('svg');
					instance.setBgcolor('foo');
					assert.isUndefined(instance.getBgcolor());
				});

			});

		});

		describe('.setTint() / .getTint()', () => {

			beforeEach(() => {
				sinon.stub(ImageTransform, 'sanitizeColorListValue').returns('sanitized');
				instance.setTint('foo');
			});

			it('[set] calls the `sanitizeColorListValue` static method with `value`', () => {
				assert.calledOnce(ImageTransform.sanitizeColorListValue);
				assert.calledWithExactly(
					ImageTransform.sanitizeColorListValue,
					'foo',
					'Image tint must be a comma-delimited list of valid hex codes and color names'
				);
			});

			it('[get] returns the sanitized `value`', () => {
				assert.strictEqual(instance.getTint(), 'sanitized');
			});

		});

	});

	it('has a `sanitizeUriValue` static method', () => {
		assert.isFunction(ImageTransform.sanitizeUriValue);
	});

	describe('.sanitizeUriValue(value)', () => {

		describe('when `value` is a string with a valid scheme', () => {

			it('returns `value`', () => {
				const testSources = [
					'ftbrand:foo',
					'ftcms:foo',
					'fthead:foo',
					'fticon:foo',
					'ftlogo:foo',
					'ftpodcast:foo',
					'ftsocial:foo',
					'http://foo/',
					'https://foo/',
					'specialisttitle:foo'
				];
				testSources.forEach(source => {
					assert.strictEqual(ImageTransform.sanitizeUriValue(source), source);
				});
			});

		});

		describe('when `value` is URL-encoded', () => {

			it('returns `value` decoded', () => {
				assert.strictEqual(ImageTransform.sanitizeUriValue('http%3A%2F%2Ffoo%2F'), 'http://foo/');
			});

		});

		describe('when `value` is a protocol-relative URL', () => {

			it('returns `value` with an HTTP protocol added', () => {
				assert.strictEqual(ImageTransform.sanitizeUriValue('//foo/'), 'http://foo/');
			});

		});

		describe('when `value` has a malformed http/https scheme with only one slash', () => {

			it('returns `value` with the additional slash added', () => {
				assert.strictEqual(ImageTransform.sanitizeUriValue('http:/foo/'), 'http://foo/');
				assert.strictEqual(ImageTransform.sanitizeUriValue('https:/foo/'), 'https://foo/');
			});

		});

		describe('when `value` has a malformed http/https scheme with no slashes', () => {

			it('returns `value` with the additional slash added', () => {
				assert.strictEqual(ImageTransform.sanitizeUriValue('http:foo/'), 'http://foo/');
				assert.strictEqual(ImageTransform.sanitizeUriValue('https:foo/'), 'https://foo/');
			});

		});

		describe('when `value` contains a hash character', () => {

			it('returns `value` without any of the content after the hash', () => {
				assert.strictEqual(ImageTransform.sanitizeUriValue('http://foo/#bar'), 'http://foo/');
				assert.strictEqual(ImageTransform.sanitizeUriValue('http%3A%2F%2Ffoo%2F%23bar'), 'http://foo/');
			});

		});

		describe('when `value` contains a double-encoded hash character', () => {

			it('returns `value` with the hash intact', () => {
				assert.strictEqual(ImageTransform.sanitizeUriValue('http://foo/%2523bar'), 'http://foo/%23bar');
			});

		});

		describe('when `value` is a string with an invalid scheme', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeUriValue('notascheme:foo'), 'Expected a URI string with a valid scheme');
			});

		});

		describe('when `value` is a string without a scheme', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeUriValue('foo'), 'Expected a URI string with a valid scheme');
			});

		});

		describe('when `value` is not a string', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeUriValue(), 'Expected a URI string with a valid scheme');
				assert.throws(() => ImageTransform.sanitizeUriValue(123), 'Expected a URI string with a valid scheme');
				assert.throws(() => ImageTransform.sanitizeUriValue(null), 'Expected a URI string with a valid scheme');
				assert.throws(() => ImageTransform.sanitizeUriValue({}), 'Expected a URI string with a valid scheme');
			});

		});

		describe('when an error is thrown', () => {

			it('the message can be set with a second parameter', () => {
				assert.throws(() => ImageTransform.sanitizeUriValue(null, 'foo'), 'foo');
			});

		});

	});

	it('has a `sanitizeNumericValue` static method', () => {
		assert.isFunction(ImageTransform.sanitizeNumericValue);
	});

	describe('.sanitizeNumericValue(value)', () => {

		describe('when `value` is a whole positive number', () => {

			it('returns `value`', () => {
				assert.strictEqual(ImageTransform.sanitizeNumericValue(123), 123);
			});

		});

		describe('when `value` is a numeric string', () => {

			it('returns `value` converted into a number', () => {
				assert.strictEqual(ImageTransform.sanitizeNumericValue('123'), 123);
			});

		});

		describe('when `value` is `undefined`', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeNumericValue());
			});

		});

		describe('when `value` is an empty string', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeNumericValue(''));
			});

		});

		describe('when `value` is smaller than `1`', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeNumericValue(0), 'Expected a whole positive number');
				assert.throws(() => ImageTransform.sanitizeNumericValue(-1), 'Expected a whole positive number');
			});

		});

		describe('when `value` is not a whole number', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeNumericValue(1.5), 'Expected a whole positive number');
			});

		});

		describe('when `value` is not a number, numeric string, or `undefined`', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeNumericValue('foo'), 'Expected a whole positive number');
				assert.throws(() => ImageTransform.sanitizeNumericValue(null), 'Expected a whole positive number');
				assert.throws(() => ImageTransform.sanitizeNumericValue({}), 'Expected a whole positive number');
			});

		});

		describe('when an error is thrown', () => {

			it('the message can be set with a second parameter', () => {
				assert.throws(() => ImageTransform.sanitizeNumericValue(null, 'foo'), 'foo');
			});

		});

	});

	it('has a `sanitizeEnumerableValue` static method', () => {
		assert.isFunction(ImageTransform.sanitizeEnumerableValue);
	});

	describe('.sanitizeEnumerableValue(value, allowedValues)', () => {

		describe('when `value` is an allowed value', () => {

			it('returns `value`', () => {
				assert.strictEqual(ImageTransform.sanitizeEnumerableValue('foo', ['foo']), 'foo');
			});

		});

		describe('when `value` is `undefined`', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeEnumerableValue());
			});

		});

		describe('when `value` is an empty string', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeEnumerableValue(''));
			});

		});

		describe('when `value` is not in `allowedValues`', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeEnumerableValue('foo', ['bar', 'baz']), 'Expected one of bar, baz');
			});

		});

		describe('when an error is thrown', () => {

			it('the message can be set with a third parameter', () => {
				assert.throws(() => ImageTransform.sanitizeEnumerableValue('foo', ['bar', 'baz'], 'qux'), 'qux');
			});

		});

	});

	it('has a `sanitizeColorValue` static method', () => {
		assert.isFunction(ImageTransform.sanitizeColorValue);
	});

	describe('.sanitizeColorValue(value)', () => {

		describe('when `value` is a valid hex code', () => {

			it('returns `value`', () => {
				assert.strictEqual(ImageTransform.sanitizeColorValue('ff0000'), 'ff0000');
			});

		});

		describe('when `value` is a short hex code', () => {

			it('returns the full hex code', () => {
				assert.strictEqual(ImageTransform.sanitizeColorValue('0f0'), '00ff00');
			});

		});

		describe('when `value` is "transparent"', () => {

			it('returns "ffffff"', () => {
				assert.strictEqual(ImageTransform.sanitizeColorValue('transparent'), 'ffffff');
			});

		});

		describe('when `value` is a named color', () => {

			it('returns the full hex code', () => {
				colornames.withArgs('red').returns('#ff0000');
				assert.strictEqual(ImageTransform.sanitizeColorValue('red'), 'ff0000');
			});

		});

		describe('when `value` is a hex code including the preceeding hash', () => {

			it('returns `value` with the hash removed', () => {
				assert.strictEqual(ImageTransform.sanitizeColorValue('#ff0000'), 'ff0000');
			});

		});

		describe('when `value` is `undefined`', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeColorValue());
			});

		});

		describe('when `value` is an empty string', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeColorValue(''));
			});

		});

		describe('when `value` contains additional whitespace', () => {

			it('returns `value` with whitespace removed', () => {
				assert.strictEqual(ImageTransform.sanitizeColorValue(' ff0000 '), 'ff0000');
			});

		});

		describe('when `value` is not a valid hex color or named color', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeColorValue('0f'), 'Expected a valid color');
				assert.throws(() => ImageTransform.sanitizeColorValue('ff00000'), 'Expected a valid color');
				assert.throws(() => ImageTransform.sanitizeColorValue('hello'), 'Expected a valid color');
			});

		});

		describe('when an error is thrown', () => {

			it('the message can be set with a second parameter', () => {
				assert.throws(() => ImageTransform.sanitizeColorValue('0f', 'foo'), 'foo');
			});

		});

	});

	it('has a `sanitizeColorListValue` static method', () => {
		assert.isFunction(ImageTransform.sanitizeColorListValue);
	});

	describe('.sanitizeColorListValue(value)', () => {

		beforeEach(() => {
			sinon.spy(ImageTransform, 'sanitizeColorValue');
		});

		describe('when `value` is a valid hex code', () => {

			it('returns an array containing `value`', () => {
				assert.deepEqual(ImageTransform.sanitizeColorListValue('ff0000'), ['ff0000']);
			});

		});

		describe('when `value` is a comma-delimited list of valid hex codes', () => {

			it('returns an array containing `value` split on commas', () => {
				assert.deepEqual(ImageTransform.sanitizeColorListValue('ff0000,00ff00'), ['ff0000', '00ff00']);
			});

			it('calls `sanitizeColorValue` with each hex code', () => {
				ImageTransform.sanitizeColorListValue('ff0000,00ff00');
				assert.calledTwice(ImageTransform.sanitizeColorValue);
				assert.calledWith(ImageTransform.sanitizeColorValue, 'ff0000');
				assert.calledWith(ImageTransform.sanitizeColorValue, '00ff00');
			});

		});

		describe('when `value` contains additional whitespace', () => {

			it('returns an array containing `value` split on commas with whitespace removed', () => {
				assert.deepEqual(ImageTransform.sanitizeColorListValue(' ff0000 , 00ff00 '), ['ff0000', '00ff00']);
			});

		});

		describe('when `value` is `undefined`', () => {

			it('returns `undefined`', () => {
				assert.isUndefined(ImageTransform.sanitizeColorListValue());
			});

		});

		describe('when `value` is an empty string', () => {

			it('returns an array containing "fff1e0"', () => {
				assert.deepEqual(ImageTransform.sanitizeColorListValue(''), ['fff1e0']);
			});

		});

		describe('when `value` contains an invalid hex color or named color', () => {

			it('throws an error', () => {
				assert.throws(() => ImageTransform.sanitizeColorListValue('ff0000,0f'), 'Expected a list of valid colors');
			});

		});

		describe('when an error is thrown', () => {

			it('the message can be set with a second parameter', () => {
				assert.throws(() => ImageTransform.sanitizeColorListValue('0f', 'foo'), 'foo');
			});

		});

	});

	it('has a `resolveCustomSchemeUri` static method', () => {
		assert.isFunction(ImageTransform.resolveCustomSchemeUri);
	});

	describe('.resolveCustomSchemeUri(uri, baseUrl)', () => {

		describe('when `uri` is an `ftbrand` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('ftbrand-v1:example', 'http://base/images'),
					'http://base/images/ftbrand/v1/example.png'
				);
			});

		});

		describe('when `uri` is an `ftcms` URI', () => {

			it('returns `uri`', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('ftcms:example', 'http://base/images'),
					'ftcms:example'
				);
			});

		});

		describe('when `uri` is an `fthead` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead-v1:example', 'http://base/images'),
					'http://base/images/fthead/v1/example.png'
				);
			});

		});

		describe('when `uri` is an `fticon` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fticon-v1:example', 'http://base/images'),
					'http://base/images/fticon/v1/example.svg'
				);
			});

		});

		describe('when `uri` is an `ftlogo` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('ftlogo-v1:example', 'http://base/images'),
					'http://base/images/ftlogo/v1/example.svg'
				);
			});

		});

		describe('when `uri` is an `ftpodcast` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('ftpodcast-v1:example', 'http://base/images'),
					'http://base/images/ftpodcast/v1/example.png'
				);
			});

		});

		describe('when `uri` is an `ftsocial` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('ftsocial-v1:example', 'http://base/images'),
					'http://base/images/ftsocial/v1/example.svg'
				);
			});

		});

		describe('when `uri` is an `http` URI', () => {

			it('returns `uri`', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('http://foo/bar', 'http://base/images'),
					'http://foo/bar'
				);
			});

		});

		describe('when `uri` is an `https` URI', () => {

			it('returns `uri`', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('https://foo/bar', 'http://base/images'),
					'https://foo/bar'
				);
			});

		});

		describe('when `uri` is a `specialisttitle` URI', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('specialisttitle-v1:example', 'http://base/images'),
					'http://base/images/specialisttitle/v1/example.svg'
				);
			});

		});

		describe('when `uri` has an unversioned scheme', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead:example', 'http://base/images'),
					'http://base/images/fthead/v1/example.png'
				);
			});

		});

		describe('when `uri` has an unversioned scheme and the mapping contains a new scheme', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fticon:example', 'http://base/images'),
					'http://base/images/fticonold/v4/example.svg'
				);
			});

		});

		describe('when `uri` has an uppercase scheme', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('FTHEAD:example', 'http://base/images'),
					'http://base/images/fthead/v1/example.png'
				);
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('FTHEAD-V1:example', 'http://base/images'),
					'http://base/images/fthead/v1/example.png'
				);
			});

		});

		describe('when `uri` has a path', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead:example/foo', 'http://base/images'),
					'http://base/images/fthead/v1/example/foo.png'
				);
			});

		});

		describe('when `uri` has a path with a trailing slash', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead:example/foo/', 'http://base/images'),
					'http://base/images/fthead/v1/example/foo.png'
				);
			});

		});

		describe('when `uri` has a path with a file extension prepopulated', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fticon-v1:foo.svg', 'http://base/images'),
					'http://base/images/fticon/v1/foo.svg'
				);
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead:foo.png', 'http://base/images'),
					'http://base/images/fthead/v1/foo.png'
				);
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead:foo.jpg', 'http://base/images'),
					'http://base/images/fthead/v1/foo.jpg'
				);
			});

		});

		describe('when `uri` has a querystring', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('http://foo/bar?foo=bar', 'http://base/images'),
					'http://foo/bar?foo=bar'
				);
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead-v1:example?foo=bar', 'http://base/images'),
					'http://base/images/fthead/v1/example.png?foo=bar'
				);
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fticon-v1:example?foo=bar', 'http://base/images'),
					'http://base/images/fticon/v1/example.svg?foo=bar'
				);
			});

		});

		describe('when `baseUrl` has a trailing slash', () => {

			it('returns the expected URI', () => {
				assert.strictEqual(
					ImageTransform.resolveCustomSchemeUri('fthead:example', 'http://base/images/'),
					'http://base/images/fthead/v1/example.png'
				);
			});

		});

		describe('when `cacheBust` is set', () => {

			describe('when `uri` is an `http` URI', () => {

				it('returns `uri` (not cache-busted)', () => {
					assert.strictEqual(
						ImageTransform.resolveCustomSchemeUri('http://foo/bar', 'http://base/images/', 'busted'),
						'http://foo/bar'
					);
				});

			});

			describe('when `uri` is an `ftcms` URI', () => {

				it('returns `uri` (not cache-busted)', () => {
					assert.strictEqual(
						ImageTransform.resolveCustomSchemeUri('ftcms:example', 'http://base/images', 'busted'),
						'ftcms:example'
					);
				});

			});

			describe('when `uri` is an `fthead` URI', () => {

				it('returns the expected URI', () => {
					assert.strictEqual(
						ImageTransform.resolveCustomSchemeUri('fthead-v1:example', 'http://base/images/', 'busted'),
						'http://base/images/fthead/v1/example.png?cacheBust=busted'
					);
				});

			});

			describe('when `uri` is an `fticon` URI', () => {

				it('returns the expected URI', () => {
					assert.strictEqual(
						ImageTransform.resolveCustomSchemeUri('fticon-v1:example', 'http://base/images/', 'busted'),
						'http://base/images/fticon/v1/example.svg?cacheBust=busted'
					);
				});

			});

			describe('when `uri` has a querystring', () => {

				it('returns the expected URI', () => {
					assert.strictEqual(
						ImageTransform.resolveCustomSchemeUri('fticon-v1:example?foo=bar', 'http://base/images/', 'busted'),
						'http://base/images/fticon/v1/example.svg?foo=bar&cacheBust=busted'
					);
				});

			});

		});

		describe('when `baseUrl` is not defined', () => {

			it('throws an error', () => {
				assert.throws(() => {
					ImageTransform.resolveCustomSchemeUri('foo:example');
				}, 'Base URL must be a valid URL');
			});

		});

		describe('when `uri` has an invalid scheme', () => {

			it('throws an error', () => {
				assert.throws(() => {
					ImageTransform.resolveCustomSchemeUri('foo:example', 'http://base/images');
				}, 'Image URI must be a string with a valid scheme');
			});

		});

		describe('when `uri` doesn\'t have a hostname', () => {

			it('throws an error', () => {
				assert.throws(() => {
					ImageTransform.resolveCustomSchemeUri('fticon:', 'http://base/images');
				}, 'Image URI must be a string with a valid scheme');
				assert.throws(() => {
					ImageTransform.resolveCustomSchemeUri('fticon', 'http://base/images');
				}, 'Image URI must be a string with a valid scheme');
			});

		});

	});

	it('has a `validFits` static property', () => {
		assert.deepEqual(ImageTransform.validFits, [
			'contain',
			'cover',
			'scale-down'
		]);
	});

	it('has a `validGravities` static property', () => {
		assert.deepEqual(ImageTransform.validGravities, [
			'faces',
			'poi'
		]);
	});

	it('has a `validFormats` static property', () => {
		assert.deepEqual(ImageTransform.validFormats, [
			'auto',
			'gif',
			'jpg',
			'png',
			'svg'
		]);
	});

	it('has a `validQualities` static property', () => {
		assert.deepEqual(ImageTransform.validQualities, [
			'lowest',
			'low',
			'medium',
			'high',
			'highest',
			'lossless'
		]);
	});

	it('has a `validUriSchemes` static property', () => {
		assert.deepEqual(ImageTransform.validUriSchemes, [
			'ftbrand',
			'ftcms',
			'fthead',
			'fticon',
			'ftlogo',
			'ftpodcast',
			'ftsocial',
			'http',
			'https',
			'specialisttitle'
		]);
	});

	it('has a `schemeVersionMap` static property', () => {
		assert.deepEqual(ImageTransform.schemeVersionMap, {
			ftbrand: 'v1',
			fthead: 'v1',
			fticon: 'fticonold/v4',
			ftlogo: 'v1',
			ftpodcast: 'v1',
			ftsocial: 'v1',
			specialisttitle: 'v1'
		});
	});

	it('has a `qualityValueMap` static property', () => {
		assert.deepEqual(ImageTransform.qualityValueMap, {
			lowest: 30,
			low: 50,
			medium: 72,
			high: 81,
			highest: 90,
			lossless: 100
		});
	});

	it('has a `qualityValueMapDpr` static property', () => {
		assert.deepEqual(ImageTransform.qualityValueMapDpr, {
			lowest: 18,
			low: 25,
			medium: 35,
			high: 45,
			highest: 55,
			lossless: 100
		});
	});

	describe('.qualityValueMapDpr', () => {

		it('has values that are lower than or equal to their equivalent in `qualityValueMap`', () => {
			ImageTransform.validQualities.forEach((quality) => {
				assert.lessThanOrEqual(ImageTransform.qualityValueMapDpr[quality], ImageTransform.qualityValueMap[quality]);
			});
		});

	});

});
