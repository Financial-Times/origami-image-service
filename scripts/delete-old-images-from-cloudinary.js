'use strict';

require('dotenv').config();
require('make-promises-safe'); // installs an 'unhandledRejection' handler

const cloudinary = require('cloudinary').v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_ACCOUNT_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates an async iterable which contains cloudinary image public ids of images which were uploaded over 30 days ago.
 *
 * @returns {AsyncIterable<string[]>} An asynchronous iterable of an array of strings which are the public IDs of the cloudinary images.
 */
async function* getAllImagesUploadedMoreThan30DaysAgo() {
	let next_cursor;
	do {
		const result = await cloudinary.search
			.expression('uploaded_at < 30d')
			.sort_by('public_id', 'desc')
			.max_results(100)
			.execute();
		next_cursor = result.next_cursor;
		const imageIDs = result.resources.map(resource => resource.public_id);
		yield imageIDs;
	} while (next_cursor);
}

/**
 * Delete images from Cloudinary
 *
 * @param {string[]} images an array of strings which are the public IDs of the cloudinary images.
 * @returns {Promise<number>} The total amount of images that were deleted, this includes images which were derived (such as webp conversions or different quality versions).
 */
async function deleteImages(images) {
	return new Promise((resolve, reject) => {
		cloudinary.api.delete_resources(images, function (error, result) {
			if (error) {
				reject(error);
			} else {
				let amountOfImagesDeleted = 0;
				for (const deleteCounts of Object.values(result.deleted_counts)) {
					amountOfImagesDeleted += deleteCounts.original;
					amountOfImagesDeleted += deleteCounts.derived;
				}
				resolve(amountOfImagesDeleted);
			}
		});
	});
}

async function main() {
	let totalAmountOfImagesDeleted = 0;
	for await (const images of getAllImagesUploadedMoreThan30DaysAgo()) {
		if (images.length > 0) {
			totalAmountOfImagesDeleted += await deleteImages(images);
		}
	}

	console.log(`Deleted ${totalAmountOfImagesDeleted} images`);
}

main();
