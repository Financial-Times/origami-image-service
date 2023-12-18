'use strict';

require('dotenv').config();
const {createClient} = require('redis');

async function getRedisClient() {
	let redisDb;

	if (process.env.REGION === 'LOCAL') {
		redisDb = await createClient();
	} else if (process.env.REGION === 'CI') {
    redisDb = await createClient({
      url: process.env.REDIS_URL,
    });
  } else {
		redisDb = await createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: true,
        rejectUnauthorized: false
      }
    });
	}
	
	redisDb.on('error', err => console.log('Redis Client Error', err)).connect();
	return redisDb;
}

module.exports = { getRedisClient };