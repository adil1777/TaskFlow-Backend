import { Queue } from 'bullmq';

import { redisConnection } from './redis';
import { TaskAssignedJob } from './notification.types';

export const NOTIFICATION_QUEUE = 'task-notifications';

export const notificationQueue = new Queue<TaskAssignedJob>(
  NOTIFICATION_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: 'exponential',
        delay: 1000,
      },

      removeOnComplete: {
        age: 60 * 60,
        count: 1000,
      },

      removeOnFail: false,
    },
  }
);
