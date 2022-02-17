'use strict';

module.exports = () => (req, res, next) => {
	res.set('Surrogate-key', 'origami-image-service');
	next();
};