

const colornames = require('colornames');
const path = require('path');
const url = require('url');

const {
    appBadge,
    ftbrand,
    ftflag,
    fticon,
    fticonV1,
    ftlogo,
    specialisttitle,
	ftpodcast,
    ftsocial,
    ftsocialV2,
} = require('./imagesets');

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
	 * @param {String} [properties.fit=cover] - The cropping strategy of the transformed image. One of contain, cover, fill, scale-down, or pad.
	 * @param {String} [properties.quality=medium] - The compression quality of the transformed image. One of lowest, low, medium, high, highest, lossless.
	 * @param {String} [properties.format=auto] - The file format of the transformed image. One of auto, jpg, png, svg.
	 * @param {String} [properties.bgcolor] - A background color to apply to the transformed image (if transparent). Hex code or named color.
	 * @param {String} [properties.overlay] - THE URI of an overlay image.
	 * @param {String} [properties.overlay_width] - Width of the overlay image. Defaults to an empty string.
	 * @param {String} [properties.overlay_height] - Height of the overlay image. Defaults to an empty string.
	 * @param {String} [properties.overlay_x] - X position of the overlay image. Defaults to 0.
	 * @param {String} [properties.overlay_y] - Y position of the overlay image. Defaults to 0.
	 * @param {String} [properties.overlay_gravity] - Gravity of the overlay image. Defaults to 'south_east'.
	 */
	constructor(properties) {
		if (properties.uri) {
			// This won't be here in placeholder mode.
			// We make sure this is set everywhere else several times.
			this.setUri(properties.uri);
		}
		this.setWidth(properties.width);
		this.setHeight(properties.height);
		this.setDpr(properties.dpr);
		this.setFit(properties.fit);
		this.setGravity(properties.gravity);
		this.setQuality(properties.quality);
		this.setFormat(properties.format);
		this.setBgcolor(properties.bgcolor);
		this.setTint(properties.tint);

		if (properties.overlay) {
			this.setOverlay(properties.overlay);
			this.setOverlayWidth(properties.overlay_width);
			this.setOverlayHeight(properties.overlay_height);
			this.setOverlayX(properties.overlay_x);
			this.setOverlayY(properties.overlay_y);
			this.setOverlayGravity(properties.overlay_gravity);
			this.setOverlayCrop(properties.overlay_crop);
		}
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
 * Get the overlay.
 * @return {String}
 */
	getOverlay() {
		return this.overlay;
	}

	/**
	 * Set the overlay
	 * @param {String} value - The URI.
	 */
	setOverlay(value) {
		this.overlay = value ? value : false;
	}


	/**
	 * Get the overlay width.
	 * @return {String | Number}
	 */
	getOverlayWidth() {
		return this.overlay_width;
	}

	/**
	 * Set the overlay width
	 * @param {String | Number} value 
	 */

	setOverlayWidth(value) {
		this.overlay_width = value;
	}

	/**
	 * Get the overlay height.
	 * @return {String | Number}
	 */
	getOverlayHeight() {
		return this.overlay_height;
	}

	/**
	 * Set the overlay height
	 * @param {String | Number} value 
	 */

	setOverlayHeight(value) {
		this.overlay_height = value;
	}


	/**
	 * Get the overlay x.
	 * @return {String | Number}
	 */
	getOverlayX() {
		return this.overlay_x;
	}

	/**
	 * Set the overlay x
	 * @param {String | Number} value 
	 */

	setOverlayX(value) {
		this.overlay_x = value;
	}

	/**
	 * Get the overlay y.
	 * @return {String | Number}
	 */
	getOverlayY() {
		return this.overlay_y;
	}

	/**
	 * Set the overlay y
	 * @param {String | Number} value 
	 */

	setOverlayY(value) {
		this.overlay_y = value;
	}


	/**
	 * Get the overlay gravity.
	 * @return {String}
	 */
	getOverlayGravity() {
		return this.overlay_gravity;
	}

	/**
	 * Set the overlay gravity
	 * @param {String} value
	 */

	setOverlayGravity(value) {
		const errorMessage = `Overlay gravity must be one of ${ImageTransform.validOverlayGravities.join(', ')}`;
		this.overlay_gravity = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validOverlayGravities, errorMessage);
	}

	/**
	 * Get the overlay crop.
	 * @return {String}
	 */
	getOverlayCrop() {
		return this.overlay_crop;
	}

	/**
	 * Set the overlay crop
	 * @param {String} value
	 */

	setOverlayCrop(value) {
		const errorMessage = `Overlay crop must be one of ${ImageTransform.validOverlayCrops.join(', ')}`;
		this.overlay_crop = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validOverlayCrops, errorMessage);
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
	 * Get the name of the transformed image.
	 * @return {String}
	 */
	getName() {
		return this.name;
	}

	/**
	 * Set the name of the transformed image.
	 * @param {String} [value] - The name of the transformed image.
	 */
	setName(value) {
		const errorMessage = 'Image name must be a string';
		if (typeof value !== 'string') {
			throw new Error(errorMessage);
		} else {
			this.name = value;
		}
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
	 * @param {String} [value=cover] - The cropping strategy. One of contain, cover, fill, or scale-down.
	 */
	setFit(value = 'cover') {
		const errorMessage = `Image fit must be one of ${ImageTransform.validFits.join(', ')}`;
		this.fit = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validFits, errorMessage);
	}

	/**
	 * Get the gravity of the transformed image.
	 * @return {String}
	 */
	getGravity() {
		return this.gravity;
	}

	/**
	 * Set the gravity of the transformed image.
	 * @param {String} [value] - The gravity that should be used when cropping. One of faces, or poi.
	 */
	setGravity(value) {
		if (value !== undefined && this.fit !== 'cover') {
			throw new Error('Gravity can only be used when fit is set to "cover"');
		}
		const errorMessage = `Image gravity must be one of ${ImageTransform.validGravities.join(', ')}`;
		this.gravity = ImageTransform.sanitizeEnumerableValue(value, ImageTransform.validGravities, errorMessage);
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
		if (this.format === 'auto' && this.quality === 100) {
			this.format = 'png';
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
		if (this.dpr && this.dpr > 1) {
			this.quality = ImageTransform.qualityValueMapDpr[quality];
		} else {
			this.quality = ImageTransform.qualityValueMap[quality];
		}
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
		if (this.format === 'png' || this.format === 'svg') {
			return this.bgcolor = undefined;
		}
		this.bgcolor = ImageTransform.sanitizeColorValue(value, errorMessage);
	}

	/**
	 * Get the tint color of the transformed image.
	 * @return {String}
	 */
	getTint() {
		return this.tint;
	}

	/**
	 * Set the tint color of the transformed image.
	 * @param {String} [value] - The background color. A comma-delimited list of hex codes and named colors.
	 */
	setTint(value) {
		const errorMessage = 'Image tint must be a comma-delimited list of valid hex codes and color names';
		this.tint = ImageTransform.sanitizeColorListValue(value, errorMessage);
	}

	/**
	 * Get the immutable property of the transformed image.
	 * @return {Boolean | Undefined}
	 */
	getImmutable() {
		return this.immutable;
	}

	/**
	 * Set the immutable color of the transformed image.
	 * @param {Boolean} [value] - The background color. A comma-delimited list of hex codes and named colors.
	 */
	setImmutable(value) {
		this.immutable = ImageTransform.sanitizeImmutableValue(value);
	}

	/**
	 * Sanitize an image transform URI value.
	 * @param {Boolean} value - The URI to sanitize.
	 * @param {String} [errorMessage] - The error message to use when the URI is invalid.
	 * @throws Will throw an error if the URI is invalid.
	 * @static
	 */
	static sanitizeImmutableValue(value, errorMessage = 'Expected a Boolean value') {
		if (typeof value !== 'boolean') {
			throw new Error(errorMessage);
		}
		return value;
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
		if (/^\/\//.test(value)) {
			value = `http:${value}`;
		}
		// Replace malformed http:abc or http:/abc schemes
		if (/^https?:/.test(value)) {
			value = value.replace(/^(https?):\/*/, '$1://');
		}
		if (value.indexOf('#') !== -1) {
			value = value.split('#')[0];
		}
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
		if (typeof value === 'string' && /px$/i.test(value)) {
			value = value.replace(/px$/i, '');
		}
		if (value === undefined || value === '') {
			return undefined;
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
		if (value === undefined || value === '') {
			return undefined;
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
		if (value === undefined || value === '') {
			return undefined;
		}
		value = value.trim();
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
	 * Sanitize an image transform color list value.
	 * @param {String} value - The color list to sanitize. A comma-delimited list of hex codes and named colors.
	 * @param {String} [errorMessage] - The error message to use when a color in the list is invalid.
	 * @throws Will throw an error if a color in the list is invalid.
	 * @static
	 */
	static sanitizeColorListValue(value, errorMessage = 'Expected a list of valid colors') {
		if (value === undefined) {
			return value;
		}
		if (typeof value === 'string' && value.trim() === '') {
			return [
				ImageTransform.colors.ftpink
			];
		}
		return value.split(',').map(color => {
			return ImageTransform.sanitizeColorValue(color, errorMessage);
		});
	}

	/**
	 * Resolve a custom scheme URI, replacing it with a full HTTP/HTTPS URI.
	 * @param {String} uri - The URI to resolve. Must have one of the following schemes: fticon, ftlogo, ftpodcast, ftsocial, http, https, ftcms, ftbrand, specialisttitle.
	 * @param {String} baseUrl - The base URL of the custom scheme image store. E.g. "https://example.com/images".
	 * @param {String} [cacheBust] - A cache-busting string to add to any images with custom schemes (excluding ftcms).
	 * @throws Will throw an error if `uri` doesn't have a valid scheme.
	 * @static
	 */
	static resolveCustomSchemeUri(uri, baseUrl, cacheBust) {
		const parsedUri = url.parse(uri.toLocaleLowerCase());
		const schemeErrorMessage = 'Image URI must be a string with a valid scheme';

		// A little error handling
		if (!baseUrl) {
			throw new Error('Base URL must be a valid URL');
		}
		if (!parsedUri.protocol || !parsedUri.hostname) {
			throw new Error(schemeErrorMessage);
		}

		// Grab the URI scheme, pathname, and query
		let scheme = parsedUri.protocol.replace(':', '');
		let pathname = path.join(parsedUri.hostname, parsedUri.pathname || '');
		let queryString = parsedUri.search || '';
		if (cacheBust) {
			queryString = (queryString ? `${queryString}&cacheBust=${cacheBust}` : `?cacheBust=${cacheBust}`);
		}

		// Replace trailing slashes in the base URL and
		// path so that we can safely concatenate them
		baseUrl = baseUrl.replace(/\/+$/, '');
		pathname = pathname.replace(/\/+$/, '');

		// Parse out the version from the scheme if it
		// has one. If the scheme ends in "-v[num]" then
		// we split it and grab the last chunk
		let version;
		if (/-v\d+$/.test(scheme)) {
			const schemeParts = scheme.split('-');
			version = schemeParts.pop();
			scheme = schemeParts.join('-');
		}

		// Default the version based on a map of current
		// image service versions
		if (!version) {
			let defaultVersion = ImageTransform.schemeVersionMap[scheme];
			if (defaultVersion && defaultVersion.includes('/')) {
				defaultVersion = defaultVersion.split('/');
				scheme = defaultVersion[0];
				version = defaultVersion[1];
			} else {
				version = defaultVersion;
			}
		}
		const pathnameExtension = path.extname(pathname);
		const pathnameWithoutExtension = path.basename(pathname, pathnameExtension);

		switch (scheme) {
			case 'ftflag':
				{
					switch (version) {
						case 'v1':
							{
								if (ftflag[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/ftflag/v1/${ftflag[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								return `${baseUrl}/__origami/service/image/internal-images/ftflag/v1/${ftflag[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}
			case 'fticon':
				{
					switch (version) {
						case 'v1':
							{
								if (fticonV1[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/fticon/v1/${fticonV1[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								return `${baseUrl}/__origami/service/image/internal-images/fticonold/v4/${fticon[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}
			case 'ftlogo':
				{
					switch (version) {
						case 'v1':
							{
								if (ftlogo[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/ftlogo/v1/${ftlogo[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								return `${baseUrl}/__origami/service/image/internal-images/ftlogo/v1/${ftlogo[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}
			case 'ftsocial':
				{
					switch (version) {
						case 'v2':
							{
								if (ftsocialV2[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/ftsocial/v2/${ftsocialV2[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						case 'v1':
						default:
							{
								if (ftsocial[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/ftsocial/v1/${ftsocial[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
					}
				}
			case 'specialisttitle':
				{
					switch (version) {
						case 'v1':
							{
								if (specialisttitle[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/specialisttitle/v1/${specialisttitle[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								if(!pathnameExtension) {
									pathname = `${pathname}.svg`;
								}
								return `${baseUrl}/__origami/service/image/internal-images/specialisttitle/v1/${specialisttitle[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}
			case 'app-badge':
				{
					switch (version) {
						case 'v1':
							{
								if (appBadge[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/app-badge/v1/${appBadge[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								return `${baseUrl}/__origami/service/image/internal-images/app-badge/v1/${appBadge[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}
			case 'ftbrand':
				{
					switch (version) {
						case 'v1':
							{
								if (ftbrand[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/ftbrand/v1/${ftbrand[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								return `${baseUrl}/__origami/service/image/internal-images/ftbrand/v1/${ftbrand[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}
			case 'ftpodcast':
				{
					switch (version) {
						case 'v1':
							{
								if (ftpodcast[pathnameWithoutExtension]) {
									return `${baseUrl}/__origami/service/image/internal-images/ftpodcast/v1/${ftpodcast[pathnameWithoutExtension].path}${queryString}`;
								} else {
									throw new Error(schemeErrorMessage);
								}
							}
						default:
							{
								if(!pathnameExtension) {
									pathname = `${pathname}.svg`;
								}
								return `${baseUrl}/__origami/service/image/internal-images/ftpodcast/v1/${ftpodcast[pathnameWithoutExtension].path}${queryString}`;
							}
					}
				}

				// For HTTP, HTTPS, and FTCMS schemes we return
				// the URL as-is for processing later
			case 'http':
			case 'https':
			case 'ftcms':
			case 'fthead':
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
			'fill',
			'scale-down',
			'pad'
		];
	}

	/**
	 * @private
	 */
	static get validGravities() {
		return [
			'faces',
			'poi'
		];
	}

	/**
	 * @private
	 */
	static get validOverlayGravities() {
		return [
			'south_east',
			'north_west',
			'south_west',
			'north_east'
		];
	}

	static get validOverlayCrops() {
		return [
			'scale',
			'crop'
		];
	}

	/**
	 * @private
	 */
	static get validFormats() {
		return [
			'auto',
			'gif',
			'jpg',
			'png',
			'svg',
			'avif',
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
			'app-badge',
			'ftbrand',
			'ftcms',
			'ftflag',
			'fticon',
			'ftlogo',
			'ftpodcast',
			'ftsocial',
			'http',
			'https',
			'specialisttitle'
		];
	}

	/**
	 * @private
	 */
	static get schemeVersionMap() {
		return {
			ftbrand: 'v1',
			ftflag: 'v1',
			ftlogo: 'v1',
			ftpodcast: 'v1',
			ftsocial: 'v1',
			specialisttitle: 'v1'
		};
	}

	/**
	 * @private
	 */
	static get qualityValueMap() {
		return {
			lowest: 30,
			low: 50,
			medium: 72,
			high: 81,
			highest: 90,
			lossless: 100
		};
	}

	/**
	 * @private
	 */
	static get qualityValueMapDpr() {
		return {
			lowest: 18,
			low: 25,
			medium: 35,
			high: 45,
			highest: 55,
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
