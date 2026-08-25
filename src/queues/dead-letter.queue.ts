import { Queue } from 'bullmq';

import { redisConnection } from './redis';

import { FailedNotificationJob } from './notification.types';

export const DEAD_LETTER_QUEUE = 'task-notifications-dlq';

export const deadLetterQueue = new Queue<FailedNotificationJob>(
  DEAD_LETTER_QUEUE,
  {
    connection: redisConnection,

    defaultJobOptions: {
      removeOnComplete: false,
      removeOnFail: false,
    },
  }
);
