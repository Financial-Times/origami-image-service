'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

// We do not wantto show deprecated image-sets on the website,
// which is why fticon and ftsocial are not imported.
const {
    ftbrand,
    ftflag,
    fticonV1,
    ftlogo,
    ftsocialV2,
    specialisttitle,
} = require('../../../imagesets');

module.exports = app => {

	// v2 url-builder page
	app.get('/v2/docs/image-sets', cacheControl({maxAge: '7d'}), (request, response) => {
		for (const item of navigation.items) {
			if (item.href === request.path) {
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
					images: Object.keys(ftbrand).map(name => {
						return {
							name,
							uri: 'ftbrand-v1:' + name
						};
					})
				},
				{
					name: 'FT Flag',
					id: 'FT-Flag',
					images: Object.keys(ftflag).map(name => {
						return {
							name,
							uri: 'ftflag-v1:' + name
						};
					})
				},
				{
					name: 'FT Icon',
					id: 'FT-Icon',
					images: Object.keys(fticonV1).map(name => {
						return {
							name,
							uri: 'fticon-v1:' + name
						};
					})
				},
				{
					name: 'FT Logo',
					id: 'FT-Logo',
					images: Object.keys(ftlogo).map(name => {
						return {
							name,
							uri: 'ftlogo-v1:' + name
						};
					})
				},
				{
					name: 'FT Social',
					id: 'FT-Social',
					images: Object.keys(ftsocialV2).map(name => {
						return {
							name,
							uri: 'ftsocial-v2:' + name
						};
					})
				},
				{
					name: 'Specialist Title',
					id: 'Specialist-Title',
					images: Object.keys(specialisttitle).map(name => {
						return {
							name,
							uri: 'specialisttitle-v1:' + name
						};
					})
				},
			]
		});
	});

};
