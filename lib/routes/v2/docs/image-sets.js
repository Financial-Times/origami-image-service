'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');
const path = require('path');

// We do not want to show deprecated image-sets on the website,
// which is why fticon and ftsocial are not imported.
const {
    ftbrand,
    ftflag,
    fticonV1,
    ftlogo,
    ftpodcast,
    ftsocialV2,
    specialisttitle,
} = require('../../../imagesets');

module.exports = app => {

	// v2 url-builder page
	app.get([
		'/v2/docs/image-sets',
		'/__origami/service/image/v2/docs/image-sets',
	], cacheControl({maxAge: '7d'}), (request, response) => {
		for (const item of navigation.items) {
			if (item.href === request.path || item.href === path.join('/__origami/service/image', request.path)) {
				item.current = true;
			} else {
				item.current = false;
			}
		}
		// Response
		response.render('image-sets', {
			title: 'Image Sets - Origami Image Service',
			navigation,
			imagesets: [
				{
					name: 'FT Brand',
					id: 'FT-Brand',
					images: Object.entries(ftbrand).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'ftbrand-v1:' + name
						};
					})
				},
				{
					name: 'FT Flag',
					id: 'FT-Flag',
					images: Object.entries(ftflag).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'ftflag-v1:' + name
						};
					})
				},
				{
					name: 'FT Icon',
					id: 'FT-Icon',
					images: Object.entries(fticonV1).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'fticon-v1:' + name
						};
					})
				},
				{
					name: 'FT Logo',
					id: 'FT-Logo',
					images: Object.entries(ftlogo).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'ftlogo-v1:' + name
						};
					})
				},
				{
					name: 'FT Podcast',
					id: 'FT-Podcast',
					images: Object.entries(ftpodcast).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'ftpodcast-v1:' + name
						};
					})
				},
				{
					name: 'FT Social',
					id: 'FT-Social',
					images: Object.entries(ftsocialV2).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'ftsocial-v2:' + name
						};
					})
				},
				{
					name: 'Specialist Title',
					id: 'Specialist-Title',
					images: Object.entries(specialisttitle).map(([name, metadata]) => {
						return {
							name,
							deprecated: metadata.deprecated,
							uri: 'specialisttitle-v1:' + name
						};
					})
				},
			]
		});
	});

};
