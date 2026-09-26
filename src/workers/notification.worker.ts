import { Worker } from 'bullmq';

import { NOTIFICATION_QUEUE } from '../queues/notification.queue';

import {
  DEAD_LETTER_QUEUE,
  deadLetterQueue,
} from '../queues/dead-letter.queue';

import { redisConnection } from '../queues/redis';

import {
  DeadLetterJobName,
  NotificationJobName,
  TaskAssignedJob,
} from '../queues/notification.types';

import { sendTaskAssignmentEmail } from './notification.processor';

const WORKER_CONCURRENCY = 5;

const notificationWorker = new Worker<TaskAssignedJob>(
  NOTIFICATION_QUEUE,

  async (job) => {
    console.log(`[WORKER] Processing job ${job.id}`);

    switch (job.name) {
      case NotificationJobName.TASK_ASSIGNED: {
        await sendTaskAssignmentEmail(
          job.data,
          job.id ? String(job.id) : undefined
        );

        break;
      }

      default:
        throw new Error(`Unsupported notification job: ${job.name}`);
    }

    console.log(`[WORKER] Job ${job.id} processed successfully`);
  },

  {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
  }
);

// ======================================================
// FAILED
// ======================================================

notificationWorker.on('failed', async (job, error) => {
  if (!job) {
    return;
  }

  const maxAttempts = job.opts.attempts ?? 1;

  const attemptsMade = job.attemptsMade;

  console.error(`[WORKER] Job ${job.id} failed`, {
    jobName: job.name,
    error: error.message,
    attemptsMade,
    maxAttempts,
  });

  // BullMQ will retry automatically.
  if (attemptsMade < maxAttempts) {
    console.log(`[WORKER] Job ${job.id} will be retried`);

    return;
  }

  // ==================================================
  // MAX ATTEMPTS REACHED
  // ==================================================

  console.error(`[DLQ] Moving job ${job.id} to dead-letter queue`);

  try {
    await deadLetterQueue.add(
      DeadLetterJobName.FAILED_NOTIFICATION,
      {
        originalJobId: String(job.id),
        originalJobName: job.name,
        failedReason: error.message,
        attemptsMade,
        maxAttempts,
        data: job.data,
      },
      {
        jobId: `dlq-${job.id}`,
      }
    );

    console.log(`[DLQ] Job ${job.id} moved successfully`);
  } catch (dlqError) {
    console.error(`[DLQ] Failed to move job ${job.id}`, dlqError);
  }
});

// ======================================================
// COMPLETED
// ======================================================

notificationWorker.on('completed', (job) => {
  console.log(`[WORKER] Job ${job.id} completed`, {
    jobName: job.name,
  });
});

// ======================================================
// WORKER ERROR
// ======================================================

notificationWorker.on('error', (error) => {
  console.error('[WORKER] Worker error', error);
});

// ======================================================
// WORKER READY
// ======================================================

notificationWorker.on('ready', () => {
  console.log('[WORKER] Notification worker ready');
});

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

const shutdownWorker = async (signal: string) => {
  console.log(`[WORKER] Received ${signal}. Shutting down...`);

  try {
    await notificationWorker.close();

    console.log('[WORKER] Worker shutdown complete');
  } catch (error) {
    console.error('[WORKER] Failed to shutdown worker', error);
  }

  process.exit(0);
};

process.once('SIGTERM', () => shutdownWorker('SIGTERM'));

process.once('SIGINT', () => shutdownWorker('SIGINT'));

export default notificationWorker;
