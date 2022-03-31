'use strict';

// This allows all origins to see values of attributes retrieved via features of the Resource Timing API, which would otherwise be reported as zero due to cross-origin restrictions.
module.exports = () => (req, res, next) => {
	res.set('Timing-Allow-Origin', '*');
	next();
};