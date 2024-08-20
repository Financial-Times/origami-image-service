const httpError = require('http-errors');
const ImageTransform = require('../image-transform');
const cloudinaryTransform = require('../transformers/cloudinary');
const url = require('url');
const axios = require('axios').default;
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const promisify = require('util').promisify;
const createErrorFromAxiosError = require('../create-error-from-axios-error');
const getColorPair = require('../get-color-pair');
const makeTextForTransform = require('../make-text-for-transform');
const FileType = require('file-type');

module.exports = processImage;

function processImage(config) {
    const imageUploadCache = Object.create(null);
    const imageMimeTypeCache = Object.create(null);

    cloudinary.config({
        cloud_name: config.cloudinaryAccountName,
        api_key: config.cloudinaryApiKey,
        api_secret: config.cloudinaryApiSecret,
    });

    const upload = promisify(cloudinary.uploader.upload.bind(cloudinary.uploader));
    const generateText = promisify(cloudinary.uploader.text.bind(cloudinary.uploader));

    return (request, response, next) => {
        const log = request.app.ft.log;
        let transform;

        // Add the URI from the path to the query so we can pass it into the transform as one object
        request.query.uri = request.params.imageUrl;

        // Create an image transform based on the query, includes some validation
        try {
            transform = new ImageTransform(request.query);
        } catch (error) {
            error.status = 400;
            error.cacheMaxAge = '1y';
            return next(error);
        }

        // Handle SVG images that need to be sanitized and possibly tinted
        if (isSvgImage(transform)) {
            prepareSvgTransform(transform, config, request);
        }

        // Handle AVIF format if supported by the browser
        applyAvifSupport(request, transform);

        // Mark the image as immutable if requested
        if (request.params.immutable) {
            transform.setImmutable(true);
        }

        let transformReady = Promise.resolve();
        const originalImageURI = transform.getUri();

        // Handle placeholder images or retrieve the image from the cache
        if (imageUploadCache[originalImageURI]) {
            transform.setName(imageUploadCache[originalImageURI]);
        } else if (request.params.imageMode === 'placeholder') {
            transformReady = handlePlaceholderImage(transform, imageUploadCache, generateText);
        } else {
            transformReady = handleRemoteImage(transform, originalImageURI, log, upload, imageUploadCache, imageMimeTypeCache);
        }

        // Remove AVIF format if the MIME type is GIF
        const mimeType = imageMimeTypeCache[originalImageURI];
        if (mimeType && mimeType.startsWith('image/gif')) {
            transform.setFormat('auto');
        }

        transformReady
            .then(() => {
                const appliedTransform = cloudinaryTransform(transform, config);
                request.transform = transform;
                request.appliedTransform = appliedTransform;
                next();
            })
            .catch(error => {
                console.error(error);
                next(error);
            });
    };
}

function isSvgImage(transform) {
    return (transform.uri && transform.format === 'svg') || /\.svg/i.test(transform.uri);
}

function prepareSvgTransform(transform, config, request) {
    const hasQueryString = url.parse(transform.uri).search;
    const encodedUri = encodeURIComponent(transform.uri);
    const tint = transform.tint ? transform.tint[0] : '';
    const hostname = config.hostname || request.hostname;
    const protocol = hostname === 'localhost' ? 'http' : 'https';

    transform.setUri(
        `${protocol}://${hostname}${hostname === 'localhost' ? ':8080' : ''}/__origami/service/image/v2/images/svgtint/${encodedUri}${hasQueryString ? '&' : '?'}color=${tint}`
    );

    // Clear the tint to avoid double tinting for rasterized formats
    if (transform.tint) {
        transform.setTint();
    }
}

function applyAvifSupport(request, transform) {
    if (request.get('accept') && request.get('accept').includes('image/avif') && transform.format === 'auto') {
        transform.setFormat('avif');
    }
}

function handlePlaceholderImage(transform, imageUploadCache, generateText) {
    transform.setFit('fill');

    if (transform.getFormat() === 'svg') {
        transform.setFormat('auto');
    }

    const info = makeTextForTransform(transform);
    transform.type = 'text';

    if (imageUploadCache[info]) {
        transform.setName(imageUploadCache[info]);
    } else {
        const hash = crypto.createHash('sha256').update(info).digest('hex');
        transform.setName(hash);

        const [font_color, background] = getColorPair();
        const padding = calculateTextPadding(transform);

        return generateText(info + padding, {
            public_id: hash,
            background,
            font_color,
            font_family: 'Roboto Mono',
            font_weight: 'bold',
            font_size: 256,
        }).then(() => {
            imageUploadCache[info] = hash;
        });
    }

    return Promise.resolve();
}

function calculateTextPadding(transform) {
    const ratio = transform.width / transform.height;
    let padding = '';
    if (ratio > 1) {
        padding += ' '.repeat(Math.round(ratio * 5));
    } else if (ratio < 1) {
        padding += '\n'.repeat(Math.round(1 / ratio));
    }
    return padding;
}

async function handleRemoteImage(transform, originalImageURI, log, upload, imageUploadCache, imageMimeTypeCache) {
    const imageURI = encodeURI(originalImageURI);
    const blockedUri = 'https://next-media-api.ft.com/renditions/16318261237260/1280x720.mp4';

    if (imageURI === blockedUri) {
        throw createHttpError(400, 'Blocked URI', '5m', true);
    }

    try {
        const initialResponse = await fetchImage(imageURI);
        validateImageResponse(initialResponse, imageURI, log);

        const fileType = await FileType.fromBuffer(initialResponse.data);
        if (fileType && fileType.mime.startsWith('video')) {
            throw createHttpError(400, 'Video files are not supported', '5m', true);
        }
        if (fileType && fileType.mime.startsWith('image/gif')) {
            transform.setFormat('auto');
        }

        const finalResponse = await fetchImage(imageURI);
        validateImageResponse(finalResponse, imageURI, log);

        const file = finalResponse.data;
        const imageName = hashBuffer(file);

        transform.setName(imageName);
        imageUploadCache[originalImageURI] = imageName;
        if (fileType && fileType.mime) {
            imageMimeTypeCache[originalImageURI] = fileType.mime;
        }

        await uploadImageToCloudinary(imageName, originalImageURI, upload);
    } catch (error) {
        const newError = createErrorFromAxiosError(error, imageURI);
        throw newError;
    }
}

function fetchImage(imageURI) {
    return axios.get(imageURI, {
        timeout: 20000, // 20 seconds
        validateStatus: status => status >= 200 && status < 600,
        responseType: 'arraybuffer',
        headers: {
            range: 'bytes=0-1000',
            'User-Agent': `FTSystem/origami-image-service-v2 (${Math.random()})`,
        },
    });
}

function validateImageResponse(response, imageURI, log) {
    if (response.status >= 400) {
        log.info(`Failed to download image from destination (${response.status}) ${imageURI}`);
        throw createHttpError(response.status, `Failed to download image: ${response.status}`, '5m', true);
    }
    if (typeof response.headers['content-type'] === 'string' && response.headers['content-type'].includes('text/html')) {
        throw createHttpError(400, 'HTML content is not valid for images', '5m', true);
    }
}

function createHttpError(status, message, cacheMaxAge, skipSentry) {
    const error = httpError(status, message);
    error.cacheMaxAge = cacheMaxAge;
    error.skipSentry = skipSentry;
    return error;
}

function hashBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function uploadImageToCloudinary(imageName, originalImageURI, upload) {
    try {
        await upload(originalImageURI, {
            public_id: imageName,
            unique_filename: false,
            use_filename: false,
            resource_type: 'image',
            overwrite: false,
        });
    } catch (error) {
        console.error('uploading the image failed:', error);
        if (error.message.includes('File size too large.') || error.message.includes('Invalid image file')) {
            error.skipSentry = true;
            error.cacheMaxAge = '5m';
        }
        throw error;
    }
}