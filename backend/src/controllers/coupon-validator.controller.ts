import { Request, Response } from "express";
import { couponValidatorService } from "../services/coupon-validator.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";

export class CouponValidatorController {
  /**
   * Validate if a coupon was successfully applied based on the validation message
   */
  async validateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { couponCode, html } = req.body;

      if (!couponCode || !html) {
        ResponseHandler.badRequest(res, "Coupon code and HTML are required");
        return;
      }

      const result = await couponValidatorService.validateCouponFromHTML(
        couponCode,
        html
      );

      if (!result.success) {
        ResponseHandler.badRequest(res, result.message);
        return;
      }

      ResponseHandler.success(res, {
        isValid: result.isValid,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in validateCoupon:", error);
      ResponseHandler.internalError(
        res,
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  }
}

export const couponValidatorController = new CouponValidatorController();
