'use strict';

require('dotenv').config();
const Redis = require('ioredis');

const redisConfig = {
  maxRetriesPerRequest: 2,
  showFriendlyErrorStack: true,
  connectTimeout: 3000,
};


  redisConfig.tls = {
    rejectUnauthorized: false
  };


const redis = new Redis(process.env.REDIS_URL, redisConfig);

module.exports = redis;