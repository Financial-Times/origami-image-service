'use strict';

const fs = require('fs');
const path = require('path');

const ftbrand = mapImagesetToNames(path.join(__dirname, '../image-sets/ftbrand/v1'));
const ftflag = mapImagesetToNames(path.join(__dirname, '../image-sets/ftflag/v1'));
const fticonold = mapImagesetToNames(path.join(__dirname, '../image-sets/fticonold/v4'));
const fticon = mapImagesetToNames(path.join(__dirname, '../image-sets/fticon/v1'));
const ftlogo = mapImagesetToNames(path.join(__dirname, '../image-sets/ftlogo/v1'));
const specialisttitle = mapImagesetToNames(path.join(__dirname, '../image-sets/specialisttitle/v1'));
const ftpodcast = mapImagesetToNames(path.join(__dirname, '../image-sets/ftpodcast/v1'));
const ftsocial = mapImagesetToNames(path.join(__dirname, '../image-sets/ftsocial/v1'));
const ftsocialV2 = mapImagesetToNames(path.join(__dirname, '../image-sets/ftsocial/v2'));

function mapImagesetToNames(imagesetLocation) {
	const entries = fs.readdirSync(imagesetLocation, {encoding: 'utf-8', withFileTypes: true});
	const files = entries.filter(entry => entry.isFile());
	const nameToPath = {};
	for (const file of files) {
		const name = path.parse(file.name).name;
		nameToPath[name] = file.name;
	}
	return nameToPath;
}

module.exports = {
    ftbrand,
    ftflag,
    fticonold,
    fticon,
    ftlogo,
    specialisttitle,
    ftpodcast,
    ftsocial,
    ftsocialV2,
};