

module.exports = function createErrorFromAxiosError(error, address) {
	let newError;
	switch (error.code) {
		case 'ENETUNREACH':
			newError = new Error(error.message);
			newError.skipSentry = true;
			newError.cacheMaxAge = '30s';
			break;
		case 'EAI_AGAIN':
			newError = new Error(`DNS lookup timed out for "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '30s';
			break;
		case 'ECONNRESET':
			newError = new Error(`Connection reset when requesting "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '30s';
			break;
		case 'ETIMEDOUT':
			newError = new Error(`Request timed out when requesting "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '30s';
			break;
		case 'ECONNABORTED':
			newError = new Error(`Request timed out when requesting "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '30s';
			break;
		case 'ENOTFOUND':
			newError = new Error(`DNS lookup failed for "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '5m';
			break;
		case 'ESERVFAIL':
			newError = new Error(`"${address}" has no DNS records`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '5m';
			break;
		case 'CERT_HAS_EXPIRED':
			newError = new Error(`Certificate has expired for "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '5m';
			break;
		case 'ERR_TLS_CERT_ALTNAME_INVALID':
			newError = new Error(error.message);
			newError.skipSentry = true;
			newError.cacheMaxAge = '5m';
			break;
		case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
			newError = new Error(
				`Unable to verify the first certificate for "${address}"`
			);
			newError.skipSentry = true;
			newError.cacheMaxAge = '5m';
			break;
		case 'ERR_UNESCAPED_CHARACTERS':
			newError = new Error(
				`Image url contains unescaped characters for "${address}"`
			);
			newError.skipSentry = true;
			newError.cacheMaxAge = '1y';
			break;
		case 'EBADNAME':
			newError = new Error(`Misformatted host name "${address}"`);
			newError.skipSentry = true;
			newError.cacheMaxAge = '1y';
			break;
		default:
			newError = error;
			break;
	}

	return newError;
};
