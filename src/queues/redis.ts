import IORedis from 'ioredis';

import serverConfig from '../config/serverConfig';

export const redisConnection = new IORedis({
  host: serverConfig.redisHost,
  port: serverConfig.redisPort,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  console.log('[REDIS] Connected');
});

redisConnection.on('ready', () => {
  console.log('[REDIS] Ready');
});

redisConnection.on('error', (error) => {
  console.error('[REDIS] Connection error', error);
});

redisConnection.on('close', () => {
  console.warn('[REDIS] Connection closed');
});
