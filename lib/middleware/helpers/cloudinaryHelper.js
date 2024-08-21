const cloudinary = require('cloudinary').v2;
const promisify = require('util').promisify;

/**
 * Create a Cloudinary setup object with the given configuration
 * @param {Object} config
 * @returns
 */
function cloudinarySetup(config) {
	cloudinary.config({
		cloud_name: config.cloudinaryAccountName,
		api_key: config.cloudinaryApiKey,
		api_secret: config.cloudinaryApiSecret,
	});

	const upload = promisify(
		cloudinary.uploader.upload.bind(cloudinary.uploader)
	);

	const generateText = promisify(
		cloudinary.uploader.text.bind(cloudinary.uploader)
	);
	return {
		upload,
		generateText,
	};
}

module.exports = cloudinarySetup;
