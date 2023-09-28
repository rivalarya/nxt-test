const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redisClient.connect();

async function getData(name) {
  return await redisClient.get(name, (err, data) => {
    if (err) {
      console.error('Error getting data from Redis:', err);
      throw new InvariantError('Internal Server Error');
    } else if (data) {
      return data;
    } else {
      return null;
    }
  });
}

async function storeData(name, data) {
  await redisClient.set(name, data, (err) => {
    if (err) {
      console.error('Error storing data in Redis:', err);
      throw new InvariantError('Internal Server Error');
    }
  });
  await redisClient.expire(name, 3600); // Expires in 1 hour
}

module.exports = { getData, storeData }
