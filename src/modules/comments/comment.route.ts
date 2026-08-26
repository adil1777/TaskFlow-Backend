import { Router } from 'express';
import commentController from './comment.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { createCommentSchema, updateCommentSchema } from './comment.validation';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.post(
  '/tasks/:taskId/comments',
  validate(createCommentSchema),
  commentController.createComment
);

router.get('/tasks/:taskId/comments', commentController.getComments);

router.patch(
  '/comments/:id',
  validate(updateCommentSchema),
  commentController.updateComment
);

router.delete('/comments/:id', commentController.deleteComment);

export default router;
