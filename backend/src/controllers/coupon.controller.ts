import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CouponService } from "../services/coupon.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { PaginationHelper } from "../utils/pagination.js";
import { paginationQuerySchema, idParamSchema } from "../utils/validators.js";

const couponQuerySchema = paginationQuerySchema.extend({
  storeName: z.string().optional(),
  platformId: z.string().optional(),
});

const storeNameBodySchema = z.object({
  name: z.string().min(1, "Store name is required"),
});

const createCouponSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  code: z.string().min(1, "Coupon code is required"),
  description: z.string().optional(),
  platformId: z.string().optional(),
  storeLink: z.string().url().optional(),
});

export class CouponController {
  static async getAllCoupons(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = couponQuerySchema.parse(req.query);
      const { page, limit } = PaginationHelper.parseParams({
        page: query.page,
        limit: query.limit,
      });

      const filters = {
        storeName: query.storeName,
        platformId: query.platformId,
      };

      const result = await CouponService.getAllCoupons(filters, page, limit);

      ResponseHandler.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Coupons retrieved successfully"
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(
          res,
          "Invalid query parameters",
          err.flatten()
        );
        return;
      }
      next(err);
    }
  }

  static async getCouponById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = idParamSchema.parse(req.params);
      const coupon = await CouponService.getCouponById(params.id);

      if (!coupon) {
        ResponseHandler.notFound(res, "Coupon not found");
        return;
      }

      ResponseHandler.success(res, coupon, "Coupon retrieved successfully");
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid coupon ID", err.flatten());
        return;
      }
      next(err);
    }
  }

  static async getCouponsByStoreName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = storeNameBodySchema.parse(req.body);
      const storeCoupons = await CouponService.getCouponsByStoreName(body.name);

      ResponseHandler.success(
        res,
        storeCoupons,
        "Store coupons retrieved successfully"
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid request body", err.flatten());
        return;
      }
      next(err);
    }
  }

  static async getCouponsByStoreId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = idParamSchema.parse(req.params);
      const query = paginationQuerySchema.parse(req.query);
      const { page, limit } = PaginationHelper.parseParams({
        page: query.page,
        limit: query.limit,
      });

      const result = await CouponService.getCouponsByStoreId(
        params.id,
        page,
        limit
      );

      ResponseHandler.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Store coupons retrieved successfully"
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid parameters", err.flatten());
        return;
      }
      next(err);
    }
  }

  static async createCoupon(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = createCouponSchema.parse(req.body);
      const coupon = await CouponService.createCoupon(body);

      ResponseHandler.success(res, coupon, "Coupon created successfully", 201);
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid request body", err.flatten());
        return;
      }
      if (err instanceof Error) {
        if (err.message.includes("already exists")) {
          ResponseHandler.conflict(res, err.message);
          return;
        }
      }
      next(err);
    }
  }
}
