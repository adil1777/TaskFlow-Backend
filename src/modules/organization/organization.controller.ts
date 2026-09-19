import { Request, Response, NextFunction } from 'express';

import organizationService from './organization.service';

import statusCodes from '../../utils/statusCodes';

const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = req.user!;

    const organizations = await organizationService.getOrganizations(userId);

    res.status(statusCodes.OK).json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

const getOrganizationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = req.user!;
    const { organizationId } = req.params;

    const organization = await organizationService.getOrganizationById(
      userId,
      organizationId as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getOrganizations,
  getOrganizationById,
};
