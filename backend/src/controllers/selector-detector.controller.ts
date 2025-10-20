import { Request, Response } from "express";
import { selectorDetectorService } from "../services/selector-detector.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";

export const detectCouponSelector = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { html, url } = req.body;

    if (!html || typeof html !== "string") {
      ResponseHandler.badRequest(res, "HTML content is required");
      return;
    }

    if (!url || typeof url !== "string") {
      ResponseHandler.badRequest(res, "URL is required");
      return;
    }

    const result = await selectorDetectorService.detectCouponSelector(
      html,
      url
    );

    if (result.success) {
      ResponseHandler.success(res, {
        selector: result.selector,
        applyButtonSelector: result.applyButtonSelector,
        message: result.message,
      });
    } else {
      ResponseHandler.badRequest(
        res,
        result.message || "Failed to detect selector"
      );
    }
  } catch (error) {
    console.error("Error in detectCouponSelector controller:", error);
    ResponseHandler.internalError(
      res,
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};
