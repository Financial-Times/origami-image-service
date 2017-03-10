'use strict';

module.exports = () => (req, res, next) => {
	res.set('Cache-Control', 'private, max-age=0, no-cache');
	res.set('Surrogate-Control', 'private, max-age=0, no-cache');
	next();
};