import { Queue } from 'bullmq';

import { redisConnection } from './redis';
import { FailedNotificationJob } from './notification.types';

export const DEAD_LETTER_QUEUE = 'task-notifications-dlq';

const DEAD_LETTER_JOB_OPTIONS = {
  removeOnComplete: false,
  removeOnFail: false,
};

export const deadLetterQueue = new Queue<FailedNotificationJob>(
  DEAD_LETTER_QUEUE,
  {
    connection: redisConnection,

    defaultJobOptions: DEAD_LETTER_JOB_OPTIONS,
  }
);
