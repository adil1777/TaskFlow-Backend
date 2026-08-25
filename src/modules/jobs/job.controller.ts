import { Request, Response, NextFunction } from 'express';

import { notificationQueue } from '../../queues/notification.queue';

import statusCodes from '../../utils/statusCodes';
import { AppError } from '../../utils/error';
import { JobParams, JobStatus } from './job.types';

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
    default:
      return JobStatus.PENDING;
  }
};

export const getJobStatus = async (
  req: Request<JobParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const job = await notificationQueue.getJob(id);

    if (!job) {
      throw new AppError(
        'Job not found',
        'JOB_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    const state = await job.getState();

    const status = getJobStatusValue(state);

    return res.status(statusCodes.OK).json({
      success: true,

      data: {
        jobId: job.id,
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
      },
    });
  } catch (error) {
    next(error);
  }
};
