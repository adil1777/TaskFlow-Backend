import { Router } from "express";

import  taskController from "./task.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { assignTaskSchema, createTaskSchema, updateTaskSchema } from "./task.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/tasks",
  validate(createTaskSchema),
  taskController.createTask
);

router.get(
  "/projects/:projectId/tasks",
  taskController.getTasks
);

router.get(
  "/tasks/:id",
  taskController.getTaskById
);

router.patch(
  "/tasks/:id",
  validate(updateTaskSchema),
  taskController.updateTask
);

router.delete(
  "/tasks/:id",
  taskController.deleteTask
);

router.post(
  "/tasks/:id/assign",
  validate(assignTaskSchema),
  taskController.assignTask
);

router.delete(
  "/tasks/:id/assign/:userId",
  taskController.unassignTask
);

router.get(
  "/projects/:projectId/dashboard",
  taskController.getDashboard
);

export default router;