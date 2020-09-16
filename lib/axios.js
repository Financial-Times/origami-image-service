'use strict';

const Axios = require('axios').default;
const http = require('http');
const https = require('https');
const { install } = require('better-lookup');

// Make http and https use a dns lookup system which caches results based on the TTL of the records.
install(http.globalAgent);
install(https.globalAgent);

module.exports = Axios;
