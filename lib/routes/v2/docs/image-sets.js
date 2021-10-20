'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

const {
    ftbrand,
    ftflag,
    fticon,
    fticonV1,
    ftlogo,
    specialisttitle,
    ftpodcast,
    ftsocial,
    ftsocialV2,
} = require('../../../imagesets');

module.exports = app => {

	// v2 url-builder page
	app.get('/v2/docs/image-sets', cacheControl({maxAge: '7d'}), (request, response) => {
		// Response
		response.render('image-sets', {
			title: 'Image Sets - Origami Image Service',
			navigation,
			imagesets: [
				{
					name: 'FT Brand',
					images: Object.keys(ftbrand).map(name => {
						return {
							name,
							uri: 'ftbrand-v1:' + name
						};
					})
				},
				{
					name: 'FT Flag',
					images: Object.keys(ftflag).map(name => {
						return {
							name,
							uri: 'ftflag-v1:' + name
						};
					})
				},
				{
					name: 'FT Icon',
					images: Object.keys(fticon).map(name => {
						return {
							name,
							uri: 'fticon:' + name
						};
					})
				},
				{
					name: 'FT Icon v1',
					images: Object.keys(fticonV1).map(name => {
						return {
							name,
							uri: 'fticon-v1:' + name
						};
					})
				},
				{
					name: 'FT Logo',
					images: Object.keys(ftlogo).map(name => {
						return {
							name,
							uri: 'ftlogo-v1:' + name
						};
					})
				},
				{
					name: 'Specialist Title',
					images: Object.keys(specialisttitle).map(name => {
						return {
							name,
							uri: 'specialisttitle-v1:' + name
						};
					})
				},
				{
					name: 'FT Podcast',
					images: Object.keys(ftpodcast).map(name => {
						return {
							name,
							uri: 'ftpodcast-v1:' + name
						};
					})
				},
				{
					name: 'FT Social',
					images: Object.keys(ftsocial).map(name => {
						return {
							name,
							uri: 'ftsocial-v1:' + name
						};
					})
				},
				{
					name: 'FT Social v2',
					images: Object.keys(ftsocialV2).map(name => {
						return {
							name,
							uri: 'ftsocial-v2:' + name
						};
					})
				},
			]
		});
	});

};
