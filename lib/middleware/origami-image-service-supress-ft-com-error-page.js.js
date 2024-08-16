

// This header is usde to make sure that origami-image-service's error pages are used
// and not replaced by the generic www.ft.com error page
module.exports = () => (req, res, next) => {
	res.set('ft-suppress-friendly-error', 'true');
	next();
};