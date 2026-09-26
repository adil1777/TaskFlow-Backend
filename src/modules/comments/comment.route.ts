import { Router } from 'express';

import commentController from './comment.controller';

import { authMiddleware } from '../../middlewares/auth.middleware';

import { createCommentSchema, updateCommentSchema } from './comment.validation';

import { validate } from '../../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

// Create Comment
// Org Admin + Project Manager + Project Member
router.post(
  '/tasks/:taskId/comments',
  validate(createCommentSchema),
  commentController.createComment
);

// View Comments
// Org Admin + Project Manager + Project Member
router.get('/tasks/:taskId/comments', commentController.getComments);

// Update Comment
// Comment Owner only
router.patch(
  '/comments/:id',
  validate(updateCommentSchema),
  commentController.updateComment
);

// Delete Comment
// Comment Owner only
router.delete('/comments/:id', commentController.deleteComment);

export default router;
