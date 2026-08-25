import { Worker } from 'bullmq';

import { NOTIFICATION_QUEUE } from '../queues/notification.queue';

import { deadLetterQueue } from '../queues/dead-letter.queue';

import { redisConnection } from '../queues/redis';

import { TaskAssignedJob } from '../queues/notification.types';
import { sendTaskAssignmentEmail } from './notification.processor';

const WORKER_CONCURRENCY = 5;

const notificationWorker = new Worker<TaskAssignedJob>(
  NOTIFICATION_QUEUE,

  async (job) => {
    console.log(`[WORKER] Processing job ${job.id}`);

    await sendTaskAssignmentEmail(job.data, String(job.id));

    console.log(`[WORKER] Job ${job.id} processed successfully`);
  },
  {
    connection: redisConnection,

    concurrency: WORKER_CONCURRENCY,
  }
);

// --------------------------------------------------
// FAILED
// --------------------------------------------------

notificationWorker.on('failed', async (job, error) => {
  if (!job) {
    return;
  }

  const maxAttempts = job.opts.attempts ?? 1;

  const attemptsMade = job.attemptsMade;

  console.error(`[WORKER] Job ${job.id} failed`, {
    error: error.message,
    attemptsMade,
    maxAttempts,
  });

  // BullMQ will retry automatically
  if (attemptsMade < maxAttempts) {
    console.log(`[WORKER] Job ${job.id} will be retried`);

    return;
  }

  // ------------------------------------------------
  // MAX ATTEMPTS REACHED
  // ------------------------------------------------

  console.log(`[DLQ] Moving job ${job.id} to DLQ`);

  try {
    await deadLetterQueue.add(
      'failed-notification',

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

// --------------------------------------------------
// COMPLETED
// --------------------------------------------------

notificationWorker.on('completed', (job) => {
  console.log(`[WORKER] Job ${job.id} completed`);
});

// --------------------------------------------------
// WORKER ERROR
// --------------------------------------------------

notificationWorker.on('error', (error) => {
  console.error('[WORKER] Worker error', error);
});

// --------------------------------------------------
// WORKER READY
// --------------------------------------------------

notificationWorker.on('ready', () => {
  console.log('[WORKER] Notification worker ready');
});

// --------------------------------------------------
// WORKER CLOSING
// --------------------------------------------------

notificationWorker.on('closing', () => {
  console.log('[WORKER] Notification worker closing');
});

// --------------------------------------------------
// GRACEFUL SHUTDOWN
// --------------------------------------------------

const shutdownWorker = async () => {
  console.log('[WORKER] Shutting down...');

  await notificationWorker.close();

  console.log('[WORKER] Shutdown complete');

  process.exit(0);
};

process.on('SIGTERM', shutdownWorker);

process.on('SIGINT', shutdownWorker);

export default notificationWorker;

// function sendTaskAssignmentEmail(
//   job: Job<TaskAssignedJob>
// ) {
//   const {
//     userEmail,
//     userName,
//     taskTitle,
//   } = job.data;

//   console.log(
//     `[EMAIL] Sending task assignment email`
//   );

//   console.log(
//     `To: ${userEmail}`
//   );

//   console.log(
//     `User: ${userName}`
//   );

//   console.log(
//     `Task: ${taskTitle}`
//   );

//   // Mock email delay
//   await new Promise((resolve) =>
//     setTimeout(resolve, 500)
//   );

//   console.log(
//     `[EMAIL] Email sent successfully`
//   );
// }
