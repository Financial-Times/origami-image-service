'use strict';

const colornames = require('colornames');
const url = require('url');

module.exports = class ImageTransform {

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

	getUri() {
		return this.uri;
	}

	setUri(value) {
		const errorMessage = 'Image URI must be a string with a valid scheme';
		this.uri = ImageTransform.sanitizeUriValue(value, errorMessage);
	}

	getWidth() {
		return this.width;
	}

	setWidth(value) {
		const errorMessage = 'Image width must be a positive whole number';
		this.width = ImageTransform.sanitizeNumericValue(value, errorMessage);
	}

	getHeight() {
		return this.height;
	}

	setHeight(value) {
		const errorMessage = 'Image height must be a positive whole number';
		this.height = ImageTransform.sanitizeNumericValue(value, errorMessage);
	}

	getDpr() {
		return this.dpr;
	}

	setDpr(value) {
		const errorMessage = 'Image DPR must be a positive whole number';
		this.dpr = ImageTransform.sanitizeNumericValue(value, errorMessage);
	}

	getFit() {
		return this.fit;
	}

	setFit(value = 'cover') {
		const errorMessage = `Image fit must be one of ${ImageTransform.validFits.join(', ')}`;
		this.fit = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validFits, errorMessage);
	}

	getFormat() {
		return this.format;
	}

	setFormat(value = 'auto') {
		const errorMessage = `Image format must be one of ${ImageTransform.validFormats.join(', ')}`;
		this.format = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validFormats, errorMessage);
		if (value === 'auto') {
			if (this.quality === 100) {
				return this.format = 'png';
			}
			this.format = 'jpg';
		}
	}

	getQuality() {
		return this.quality;
	}

	setQuality(value = 'medium') {
		const errorMessage = `Image quality must be one of ${ImageTransform.validQualities.join(', ')}`;
		const quality = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validQualities, errorMessage);
		this.quality = ImageTransform.qualityValueMap[quality];
	}

	getBgcolor() {
		return this.bgcolor;
	}

	setBgcolor(value) {
		const errorMessage = 'Image bgcolor must be a valid hex code or color name';
		this.bgcolor = ImageTransform.sanitizeColorValue(value, errorMessage);
	}

	static sanitizeUriValue(value, errorMessage = 'Expected a URI string with a valid scheme') {
		if (typeof value !== 'string') {
			throw new Error(errorMessage);
		}
		value = decodeURIComponent(value);
		const scheme = url.parse(value).protocol.slice(0, -1);
		if (!ImageTransform.validUriSchemes.includes(scheme)) {
			throw new Error(errorMessage);
		}
		return value;
	}

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

	static get validFits() {
		return [
			'contain',
			'cover',
			'scale-down'
		];
	}

	static get validFormats() {
		return [
			'auto',
			'jpg',
			'png',
			'svg'
		];
	}

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

	static get colors() {
		return {
			black: '000000',
			ftpink: 'fff1e0',
			white: 'ffffff'
		};
	}

};
