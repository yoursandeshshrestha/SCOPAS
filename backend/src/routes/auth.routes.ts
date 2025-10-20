import { Router } from "express";
import {
  signinHandler,
  signupHandler,
  logoutHandler,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signupHandler);
router.post("/signin", signinHandler);
router.post("/logout", logoutHandler);

export default router;
