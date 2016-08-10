'use strict';

const colornames = require('colornames');
const path = require('path');
const url = require('url');

/**
 * Class representing a set of image transforms.
 */
module.exports = class ImageTransform {

	/**
	 * Create an ImageTransform.
	 * @param {Object} properties - The transform properties to represent.
	 * @param {String} properties.uri - The URI to apply the image transform to.
	 * @param {(String|Number)} [properties.width] - The width of the transformed image in pixels.
	 * @param {(String|Number)} [properties.height] - The height of the transformed image in pixels.
	 * @param {(String|Number)} [properties.dpr=1] - The device-pixel ratio of the transformed image.
	 * @param {String} [properties.fit=cover] - The cropping strategy of the transformed image. One of contain, cover, or scale-down.
	 * @param {String} [properties.quality=medium] - The compression quality of the transformed image. One of lowest, low, medium, high, highest, lossless.
	 * @param {String} [properties.format=auto] - The file format of the transformed image. One of auto, jpg, png, svg.
	 * @param {String} [properties.bgcolor] - A background color to apply to the transformed image (if transparent). Hex code or named color.
	 */
	constructor(properties) {
		this.setUri(properties.uri);
		this.setWidth(properties.width);
		this.setHeight(properties.height);
		this.setDpr(properties.dpr);
		this.setFit(properties.fit);
		this.setQuality(properties.quality);
		this.setFormat(properties.format);
		this.setBgcolor(properties.bgcolor);
	}

	/**
	 * Get the URI that the transform is being applied to.
	 * @return {String}
	 */
	getUri() {
		return this.uri;
	}

	/**
	 * Set the URI that the transform is being applied to.
	 * @param {String} value - The URI.
	 */
	setUri(value) {
		const errorMessage = 'Image URI must be a string with a valid scheme';
		this.uri = ImageTransform.sanitizeUriValue(value, errorMessage);
	}

	/**
	 * Get the width of the transformed image in pixels.
	 * @return {Number}
	 */
	getWidth() {
		return this.width;
	}

	/**
	 * Set the width of the transformed image in pixels.
	 * @param {(String|Number)} [value] - The width.
	 */
	setWidth(value) {
		const errorMessage = 'Image width must be a positive whole number';
		this.width = ImageTransform.sanitizeNumericValue(value, errorMessage);
	}

	/**
	 * Get the height of the transformed image in pixels.
	 * @return {Number}
	 */
	getHeight() {
		return this.height;
	}

	/**
	 * Set the height of the transformed image in pixels.
	 * @param {(String|Number)} [value] - The height.
	 */
	setHeight(value) {
		const errorMessage = 'Image height must be a positive whole number';
		this.height = ImageTransform.sanitizeNumericValue(value, errorMessage);
	}

	/**
	 * Get the device-pixel ratio of the transformed image.
	 * @return {Number}
	 */
	getDpr() {
		return this.dpr;
	}

	/**
	 * Set the device-pixel ratio of the transformed image.
	 * @param {(String|Number)} [value=1] - The DPR.
	 */
	setDpr(value) {
		const errorMessage = 'Image DPR must be a positive whole number';
		this.dpr = ImageTransform.sanitizeNumericValue(value, errorMessage);
	}

	/**
	 * Get the cropping strategy of the transformed image.
	 * @return {String}
	 */
	getFit() {
		return this.fit;
	}

	/**
	 * Set the cropping strategy of the transformed image.
	 * @param {String} [value=cover] - The cropping strategy. One of contain, cover, or scale-down.
	 */
	setFit(value = 'cover') {
		const errorMessage = `Image fit must be one of ${ImageTransform.validFits.join(', ')}`;
		this.fit = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validFits, errorMessage);
	}

	/**
	 * Get the file format of the transformed image.
	 * @return {String}
	 */
	getFormat() {
		return this.format;
	}

	/**
	 * Set the file format of the transformed image.
	 * @param {String} [value=auto] - The file format. One of auto, jpg, png, svg.
	 */
	setFormat(value = 'auto') {
		const errorMessage = `Image format must be one of ${ImageTransform.validFormats.join(', ')}`;
		this.format = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validFormats, errorMessage);
		if (value === 'auto') {
			if (/\.svg/i.test(this.uri)) {
				return this.format = 'svg';
			}
			if (this.quality === 100) {
				return this.format = 'png';
			}
			this.format = 'jpg';
		}
	}

	/**
	 * Get the compression quality of the transformed image.
	 * @return {Number}
	 */
	getQuality() {
		return this.quality;
	}

	/**
	 * Set the compression quality of the transformed image.
	 * @param {String} [value=medium] - The compression quality. One of lowest, low, medium, high, highest, lossless.
	 */
	setQuality(value = 'medium') {
		const errorMessage = `Image quality must be one of ${ImageTransform.validQualities.join(', ')}`;
		const quality = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validQualities, errorMessage);
		this.quality = ImageTransform.qualityValueMap[quality];
	}

	/**
	 * Get the background color of the transformed image.
	 * @return {String}
	 */
	getBgcolor() {
		return this.bgcolor;
	}

	/**
	 * Set the background color of the transformed image.
	 * @param {String} [value] - The background color. Hex code or named color.
	 */
	setBgcolor(value) {
		const errorMessage = 'Image bgcolor must be a valid hex code or color name';
		this.bgcolor = ImageTransform.sanitizeColorValue(value, errorMessage);
	}

	/**
	 * Sanitize an image transform URI value.
	 * @param {String} value - The URI to sanitize.
	 * @param {String} [errorMessage] - The error message to use when the URI is invalid.
	 * @throws Will throw an error if the URI is invalid.
	 * @static
	 */
	static sanitizeUriValue(value, errorMessage = 'Expected a URI string with a valid scheme') {
		if (typeof value !== 'string') {
			throw new Error(errorMessage);
		}
		value = decodeURIComponent(value);
		const parsedUri = url.parse(value);
		const scheme = (parsedUri.protocol ? parsedUri.protocol.slice(0, -1) : parsedUri.protocol);
		if (!ImageTransform.validUriSchemes.includes(scheme)) {
			throw new Error(errorMessage);
		}
		return value;
	}

	/**
	 * Sanitize an image transform numeric value.
	 * @param {(String|Number)} value - The number to sanitize.
	 * @param {String} [errorMessage] - The error message to use when the number is invalid.
	 * @throws Will throw an error if the number is invalid, has 1 or more decimal places, or is negative.
	 * @static
	 */
	static sanitizeNumericValue(value, errorMessage = 'Expected a whole positive number') {
		if (value === undefined) {
			return value;
		}
		if (typeof value !== 'string' && typeof value !== 'number') {
			throw new Error(errorMessage);
		}
		value = Number(value);
		if (value < 1 || isNaN(value) || value % 1 !== 0) {
			throw new Error(errorMessage);
		}
		return value;
	}

	/**
	 * Sanitize a value, making sure it is a member of a list of allowed values.
	 * @param {*} value - The value to sanitize.
	 * @param {Array} allowedValues - The values that `value` is validated against.
	 * @param {String} [errorMessage] - The error message to use when the value is invalid.
	 * @throws Will throw an error if `value` does not appear in `allowedValues`.
	 * @static
	 */
	static sanitizeEnumerableValue(value, allowedValues, errorMessage) {
		if (value === undefined) {
			return value;
		}
		if (arguments.length < 3) {
			errorMessage = `Expected one of ${allowedValues.join(', ')}`;
		}
		if (!allowedValues.includes(value)) {
			throw new Error(errorMessage);
		}
		return value;
	}

	/**
	 * Sanitize an image transform color value.
	 * @param {String} value - The color to sanitize. Either a hex code or a named color.
	 * @param {String} [errorMessage] - The error message to use when the color is invalid.
	 * @throws Will throw an error if the color is invalid.
	 * @static
	 */
	static sanitizeColorValue(value, errorMessage = 'Expected a valid color') {
		if (value === undefined) {
			return value;
		}
		if (value === 'transparent') {
			return ImageTransform.colors.white;
		}
		if (!/^#?[0-9a-f]{3,6}$/i.test(value)) {
			value = colornames(value);
		}
		if (!value) {
			throw new Error(errorMessage);
		}
		if (value[0] === '#') {
			value = value.substr(1);
		}
		if (/^[0-9a-f]{3}$/i.test(value)) {
			value = value.split('').map(character => character + character).join('');
		}
		return value;
	}

	/**
	 * Resolve a custom scheme URI, replacing it with a full HTTP/HTTPS URI.
	 * @param {String} uri - The URI to resolve. Must have one of the following schemes: fticon, ftlogo, ftsocial, fthead, ftpodcast, http, https, ftcms.
	 * @param {String} baseUrl - The base URL of the custom scheme image store. E.g. "https://example.com/images".
	 * @throws Will throw an error if `uri` doesn't have a valid scheme.
	 * @static
	 */
	static resolveCustomSchemeUri(uri, baseUrl) {
		const parsedUri = url.parse(uri);
		const schemeErrorMessage = 'Image URI must be a string with a valid scheme';

		// A little error handling
		if (!baseUrl) {
			throw new Error('Base URL must be a valid URL');
		}
		if (!parsedUri.protocol || !parsedUri.hostname) {
			throw new Error(schemeErrorMessage);
		}

		// Grab the URI scheme and pathname
		let scheme = parsedUri.protocol.replace(':', '');
		let pathname = path.join(parsedUri.hostname, parsedUri.pathname || '');

		// Replace trailing slashes in the base URL and
		// path so that we can safely concatenate them
		baseUrl = baseUrl.replace(/\/+$/, '');
		pathname = pathname.replace(/\/+$/, '');

		// Parse out the version from the scheme if it
		// has one. If the sceme ends in "-v[num]" then
		// we split it and grab the last chunk
		let version;
		if (/\-v\d+$/.test(scheme)) {
			scheme = scheme.split('-');
			version = scheme.pop();
			scheme = scheme.join('-');
		}
		// Default the version to "unversioned"
		version = version || 'unversioned';

		switch (scheme) {

			// SVG-based schemes. Here we're mostly adding
			// the .svg extension if there isn't an extension
			// specified already
			case 'fticon':
			case 'ftlogo':
			case 'ftsocial':
				if(!path.extname(pathname)) {
					pathname = `${pathname}.svg`;
				}
				return `${baseUrl}/${scheme}/${version}/${pathname}`;

			// PNG-based schemes. Here we're mostly adding
			// the .png extension if there isn't an extension
			// specified already
			case 'fthead':
			case 'ftpodcast':
				if(!path.extname(pathname)) {
					pathname = `${pathname}.png`;
				}
				return `${baseUrl}/${scheme}/${version}/${pathname}`;

			// For HTTP, HTTPS, and FTCMS schemes we return
			// the URL as-is for processing later
			case 'http':
			case 'https':
			case 'ftcms':
				return uri;
			default:
				throw new Error(schemeErrorMessage);
		}
	}

	/**
	 * @private
	 */
	static get validFits() {
		return [
			'contain',
			'cover',
			'scale-down'
		];
	}

	/**
	 * @private
	 */
	static get validFormats() {
		return [
			'auto',
			'jpg',
			'png',
			'svg'
		];
	}

	/**
	 * @private
	 */
	static get validQualities() {
		return [
			'lowest',
			'low',
			'medium',
			'high',
			'highest',
			'lossless'
		];
	}

	/**
	 * @private
	 */
	static get validUriSchemes() {
		return [
			'ftcms',
			'fthead',
			'fticon',
			'ftlogo',
			'ftpodcast',
			'ftsocial',
			'http',
			'https'
		];
	}

	/**
	 * @private
	 */
	static get qualityValueMap() {
		return {
			lowest: 30,
			low: 50,
			medium: 70,
			high: 80,
			highest: 90,
			lossless: 100
		};
	}

	/**
	 * @private
	 */
	static get colors() {
		return {
			black: '000000',
			ftpink: 'fff1e0',
			white: 'ffffff'
		};
	}

};
