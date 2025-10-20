import { Router } from "express";
import { detectCouponSelector } from "../controllers/selector-detector.controller.js";

const router = Router();

// POST /api/v1/selector/detect - Detect coupon input selector from HTML
router.post("/detect", detectCouponSelector);

export default router;

