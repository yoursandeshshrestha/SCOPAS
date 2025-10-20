import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Get all coupons with optional filters (storeName, platformId) and pagination
router.get("/", CouponController.getAllCoupons);

// Get coupons by store name (POST request with body)
router.post("/by-store", CouponController.getCouponsByStoreName);

// Create a new coupon (requires authentication)
router.post("/", CouponController.createCoupon);

// Get coupon by ID
router.get("/:id", CouponController.getCouponById);

// Get coupons by store ID with pagination
router.get("/store/:id", CouponController.getCouponsByStoreId);

export default router;
