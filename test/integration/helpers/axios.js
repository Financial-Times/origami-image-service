

const process = require('process');
const axios = require('axios').default;

module.exports = axios.create({
    baseURL: process.env.HOST || 'http://localhost:8080',
    maxRedirects: 0,
	decompress: false,
    validateStatus: function (status) {
        return status >= 200 && status < 599;
    },
});
