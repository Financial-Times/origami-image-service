const cloudinary = require('cloudinary').v2;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_ACCOUNT_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates an async iterable which contains cloudinary image public ids of images which were uploaded 30 days ago.
 *
 * @returns {AsyncIterable<string[]>} An asynchronous iterable of an array of strings which are the public IDs of the cloudinary images.
 */
async function* getImagesUploaded30DaysAgo() {
	let next_cursor;
	do {
		try {
			const result = await cloudinary.search
				.expression('created_at:[31d TO 30d]')
				.sort_by('created_at', 'asc')
				.next_cursor(next_cursor)
				.max_results(100)
				.execute();
			next_cursor = result.next_cursor;
			const imageIDs = result.resources.map(resource => resource.public_id);
			yield imageIDs;
		} catch (error) {
			console.error('Error fetching images:', error);
			// Return early to stop further processing if there's an error
			return;
		}
	} while (next_cursor);
}

/**
 * Delete images from Cloudinary
 *
 * @param {string[]} images an array of strings which are the public IDs of the cloudinary images.
 * @returns {Promise<number>} The total amount of images that were deleted, this includes images which were derived (such as webp conversions or different quality versions).
 */
async function deleteImages(images) {
	try {
		const result = await cloudinary.api.delete_resources(images, {
			keep_original: true
		});

		let amountOfImagesDeleted = 0;
		for (const deleteCounts of Object.values(result.deleted_counts)) {
			amountOfImagesDeleted += deleteCounts.original;
			amountOfImagesDeleted += deleteCounts.derived;
		}
		return amountOfImagesDeleted;
	} catch (error) {
		console.error('Error deleting images:', error);
		return 0; // continue processing
	}
}

async function main() {
	console.log('delete-old-images-from-cloudinary: Start');
	try {
		let totalAmountOfImagesDeleted = 0;
		for await (const images of getImagesUploaded30DaysAgo()) {
			if (images.length > 0) {
				const countOfImagesJustDeleted = await deleteImages(images);
				totalAmountOfImagesDeleted += countOfImagesJustDeleted;
				console.log(`delete-old-images-from-cloudinary: ${countOfImagesJustDeleted} Images Deleted`);
			}
		}

		console.log(`delete-old-images-from-cloudinary: ${totalAmountOfImagesDeleted} Images Deleted In Total`);
		console.log('delete-old-images-from-cloudinary: Finish');
	} catch (e) {
		console.log('Error in main process:', e);
	}
}

main().catch(e => {
	console.error('Unhandled error in main:', e);
});
