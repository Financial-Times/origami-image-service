'use strict';

require('dotenv').config();
const Redis = require('ioredis');

const prodConfig = {
  maxRetriesPerRequest: 1,
  tls: {
    rejectUnauthorized: false
  },
};

const isProduction = process.env.REGION === 'EU' || process.env.REGION === 'US';

const redis = new Redis(process.env.REDIS_URL, isProduction ? prodConfig : undefined);

module.exports = redis;