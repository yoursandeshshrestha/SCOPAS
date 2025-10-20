import { Router } from "express";
import { couponValidatorController } from "../controllers/coupon-validator.controller.js";

const router = Router();

// POST /api/coupon-validator/validate
router.post("/validate", (req, res) =>
  couponValidatorController.validateCoupon(req, res)
);

export default router;
