import { Router } from "express";
import authController from "./auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();


router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh
);

router.post(
  "/logout",
  validate(logoutSchema),
  authController.logout
);


export default router;
