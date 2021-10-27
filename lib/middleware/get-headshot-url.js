'use strict';

const httpError = require('http-errors');
const axios = require('axios').default;
const dnsLookup = require('lookup-dns-cache').lookup;
const createErrorFromAxiosError = require('../create-error-from-axios-error');

module.exports = getHeadshotUrl;

function findAuthor(concepts = [], author) {
	return concepts.find(concept => {
		const name = concept.prefLabel.toLowerCase().replace(/\s/g, '-');
		return name === author;
	});
}

async function ftApiRequest(url, key) {
	try {
		return await axios.get(url, {
			headers: {
				'x-api-key': key
			},
			timeout: 10000, // 10 seconds
			validateStatus: function (status) {
				return status >= 200 && status < 600;
			},
			lookup: dnsLookup,
		});
	} catch (error) {
		throw createErrorFromAxiosError(error, url);
	}
}

function getHeadshotUrl(config) {
	const cache = Object.create(null);
	return async (request, response, next) => {

		const scheme = 'fthead';
		if (!request.params.imageUrl.startsWith(scheme)) {
			return next();
		}

		const uriParts = request.params.imageUrl.split(':').pop().split('?');
		const name = uriParts.shift();
		request.params.schemeUrl = `${scheme}:${name}`;
		
		// In error scenarios, the name is being output into the html
		// We first check the name is not an XSS vector.
		// If we think it is potentially an XSS vector, we return an error.
		if (!/^\p{Letter}+(-\p{Letter}+)$/u.test(name)) {
			const error = httpError(404, 'Refusing to get image for the provided name - The image name was an unexpected format. If this name should work, please contact someone from the Origami team.');
			error.cacheMaxAge = '1d';
			error.skipSentry = true;
			next(error);
			return;
		}

		const cmsURL = cache[name];
		if (cmsURL) {
			request.params.imageUrl = cmsURL;
			next();
		} else {
			try {
				const capi = `https://api.ft.com/concepts?type=http://www.ft.com/ontology/person/Person&mode=search&q=${encodeURIComponent(name)}&boost=authors`;
				const conceptSearchResponse = await ftApiRequest(capi, config.contentApiKey);
				if (conceptSearchResponse.status >= 500) {
					const error = httpError(500, `Unable to get image for ${name} - The url "${capi}" responded with a ${conceptSearchResponse.status} status code.`);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				} else if (conceptSearchResponse.status >= 400) {
					const error = httpError(404, `Unable to get image for ${name} - The url "${capi}" responded with a ${conceptSearchResponse.status} status code.`);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}
				const concepts = (conceptSearchResponse.data && conceptSearchResponse.data.concepts) || [];
				const author = findAuthor(concepts, name);
				if (!author) {
					const error = httpError(404, `Unable to get image for ${name} - No author found who matches that name.`);
					// There are applications which use the fthead scheme as a way to check if a person has a headshot.
					// If the Concept Search API responds with a 2xx and no match for the requested person, then we cache it for 24 hours 
					// because it is unlikely that the API will have been updated in the next 24 hours with the person as a new concept.
					error.cacheMaxAge = '1d';
					error.skipSentry = true;
					throw error;
				}
				const peopleResponse = await ftApiRequest(author.apiUrl, config.contentApiKey);
				if (peopleResponse.status >= 500) {
					const error = httpError(500, `Unable to get image for ${name} - The url "${author.apiUrl}" responded with a ${peopleResponse.status} status code.`);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}
				if (peopleResponse.status >= 400) {
					const error = httpError(404, `Unable to get image for ${name} - The url "${author.apiUrl}" responded with a ${peopleResponse.status} status code.`);
					error.cacheMaxAge = '5m';
					error.skipSentry = true;
					throw error;
				}

				const imageUrl = peopleResponse.data && peopleResponse.data._imageUrl;
				if (!imageUrl) {
					const error = httpError(404, `Unable to get image for ${name} - The author has no headshot.`);
					// There are applications which use the fthead scheme as a way to check if a person has a headshot.
					// If the People API responds with a 2xx and no _imageUrl, then we cache it for 24 hours 
					// because it is unlikely that the API will have been updated in the next 24 hours with a headshot for the person
					error.cacheMaxAge = '1d';
					error.skipSentry = true;
					throw error;
				}
				request.params.imageUrl = imageUrl;
				cache[name] = imageUrl;
				next();
			} catch(error) {
				next(error);
			}
		}
	};
}
