import { Request, Response, NextFunction } from 'express';

import organizationService from './organization.service';

import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';

//Create  organization with org_admin
const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await organizationService.createOrganization(req.body);

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.ORGANIZATION_CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Organizations
const getAllOrganizations = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizations = await organizationService.getAllOrganizations();

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.ORGANIZATIONS_FETCHED,
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

// Get Organization By organization Id
const getOrganizationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = await organizationService.getOrganizationById(
      req.params.organizationId as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.ORGANIZATION_FETCHED,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// Get Organization
const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = await organizationService.updateOrganization(
      req.params.organizationId as string,
      req.body
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.ORGANIZATION_UPDATED,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

//Delete Organization
const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = await organizationService.deleteOrganization(
      req.params.organizationId as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.ORGANIZATION_DELETED,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// Get Members
const getOrganizationMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const members = await organizationService.getOrganizationMembers(
      req.params.organizationId as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.ORGANIZATION_MEMEBER_FETCHED,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// Add Member
const addOrganizationMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = await organizationService.addOrganizationMember(
      req.params.organizationId as string,
      req.body
    );

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.MEMBER_ADDED,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Update Member
const updateOrganizationMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = await organizationService.updateOrganizationMember(
      req.params.organizationId as string,
      req.params.userId as string,
      req.body
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.ORGANIZATION_MEMEBER_UPDATED,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Remove Member
const removeOrganizationMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await organizationService.removeOrganizationMember(
      req.params.organizationId as string,
      req.params.userId as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.MEMBER_REMOVED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,

  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
};
