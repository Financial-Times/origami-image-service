'use strict';

require('dotenv').config();
const Redis = require('ioredis');

const redisConfig = {
  maxRetriesPerRequest: 1,
  showFriendlyErrorStack: true,
  connectTimeout: 3000,
};

const isProduction = process.env.REGION === 'EU' || process.env.REGION === 'US';

if (isProduction) {
  redisConfig.tls = {
    rejectUnauthorized: false
  };
}

const redis = new Redis(process.env.REDIS_URL, redisConfig);

module.exports = redis;