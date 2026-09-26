import { notificationQueue } from '../../queues/notification.queue';

import statusCodes from '../../utils/statusCodes';
import { AppError } from '../../utils/error';

import { JobStatus, JobStatusResponse } from './job.types';

const getJobStatusValue = (state: string): JobStatus => {
  switch (state) {
    case 'active':
      return JobStatus.ACTIVE;

    case 'completed':
      return JobStatus.COMPLETED;

    case 'failed':
      return JobStatus.FAILED;

    case 'waiting':
    case 'delayed':
    case 'waiting-children':
    case 'paused':
    default:
      return JobStatus.PENDING;
  }
};

const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  try {
    const job = await notificationQueue.getJob(jobId);

    if (!job) {
      throw new AppError(
        'Job not found',
        'JOB_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    const state = await job.getState();

    const status = getJobStatusValue(state);

    return {
      jobId: String(job.id),

      status,

      metadata: {
        name: job.name,
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts.attempts ?? 1,
        createdAt: job.timestamp,
        processedOn: job.processedOn ?? null,
        finishedOn: job.finishedOn ?? null,
        failedReason: job.failedReason ?? null,
      },
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getJobStatus,
};
