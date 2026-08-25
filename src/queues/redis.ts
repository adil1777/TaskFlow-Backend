import IORedis from 'ioredis';
import serverConfig from '../config/serverConfig';

const redisOptions = {
  maxRetriesPerRequest: null,
};

export const redisConnection = serverConfig.redisUrl
  ? new IORedis(serverConfig.redisUrl, redisOptions)
  : new IORedis({
      host: serverConfig.redisHost,
      port: serverConfig.redisPort,
      ...redisOptions,
    });

redisConnection.on('connect', () => {
  console.log('[REDIS] Connected');
});

redisConnection.on('ready', () => {
  console.log('[REDIS] Ready');
});

redisConnection.on('error', (error) => {
  console.error('[REDIS] Connection error:', error);
});

redisConnection.on('close', () => {
  console.warn('[REDIS] Connection closed');
});
