import { Request, Response, NextFunction } from 'express';

import commentService from './comment.service';
import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';

//CREATE COMMENT
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const comment = await commentService.createComment(
      user.organizationId,
      user.id,
      req.params.taskId as string,
      req.body
    );

    res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.COMENT_CREATED,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

//GET COMMENTS
const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const comments = await commentService.getComments(
      user.organizationId,
      req.params.taskId as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.COMMENT_FETCHED,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

//UPDATE COMMENT
const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const comment = await commentService.updateComment(
      user.organizationId,
      user.id,
      req.params.id as string,
      req.body
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.COMMENT_UPDATED,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

//DELET COMMENT
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const result = await commentService.deleteComment(
      user.organizationId,
      user.id,
      req.params.id as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.COMMENT_DELETED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
