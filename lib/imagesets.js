'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const appBadge = mapImagesetToNames(path.join(__dirname, '../image-sets/app-badge/v1'));
const ftbrand = mapImagesetToNames(path.join(__dirname, '../image-sets/ftbrand/v1'));
const ftflag = mapImagesetToNames(path.join(__dirname, '../image-sets/ftflag/v1'));
const fticon = mapImagesetToNames(path.join(__dirname, '../image-sets/fticonold/v4'));
const fticonV1 = mapImagesetToNames(path.join(__dirname, '../image-sets/fticon/v1'));
const ftlogo = mapImagesetToNames(path.join(__dirname, '../image-sets/ftlogo/v1'));
const specialisttitle = mapImagesetToNames(path.join(__dirname, '../image-sets/specialisttitle/v1'));
const ftpodcast = mapImagesetToNames(path.join(__dirname, '../image-sets/ftpodcast/v1'));
const ftsocial = mapImagesetToNames(path.join(__dirname, '../image-sets/ftsocial/v1'));
const ftsocialV2 = mapImagesetToNames(path.join(__dirname, '../image-sets/ftsocial/v2'));

function mapImagesetToNames(imagesetLocation) {
	const entries = fs.readdirSync(imagesetLocation, {encoding: 'utf-8', withFileTypes: true});
	const deprecatedImages = JSON.parse(fs.readFileSync(path.join(imagesetLocation, '/deprecated.json'), {encoding: 'utf-8'}));
	const files = entries.filter(entry => entry.isFile());
	const nameToPath = {};
	for (const file of files) {
        const type = mime.lookup(file.name);
        if (type && type.startsWith('image')) {
            const name = path.parse(file.name).name;
            nameToPath[name] = {};
            nameToPath[name].path = file.name;
            nameToPath[name].deprecated = deprecatedImages.includes(name);
        }
	}
	return nameToPath;
}

module.exports = {
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
};