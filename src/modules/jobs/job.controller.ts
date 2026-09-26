import { Request, Response, NextFunction } from 'express';

import statusCodes from '../../utils/statusCodes';

import jobService from './job.service';
import { JobParams } from './job.types';

export const getJobStatus = async (
  req: Request<JobParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await jobService.getJobStatus(id);

    return res.status(statusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
