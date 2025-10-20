import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { StoreService } from "../services/store.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { PaginationHelper } from "../utils/pagination.js";
import { storeQuerySchema, idParamSchema } from "../utils/validators.js";

export class StoreController {
  static async getAllStores(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = storeQuerySchema.parse(req.query);
      const { page, limit } = PaginationHelper.parseParams({
        page: query.page,
        limit: query.limit,
      });

      const filters = {
        letter: query.letter,
        search: query.search,
      };

      const result = await StoreService.getAllStores(filters, page, limit);

      ResponseHandler.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Stores retrieved successfully"
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid query parameters", err.flatten());
        return;
      }
      next(err);
    }
  }

  static async getStoreById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = idParamSchema.parse(req.params);
      const store = await StoreService.getStoreById(params.id);

      if (!store) {
        ResponseHandler.notFound(res, "Store not found");
        return;
      }

      ResponseHandler.success(res, store, "Store retrieved successfully");
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid store ID", err.flatten());
        return;
      }
      next(err);
    }
  }

  static async getStoreByName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name } = req.params;
      
      if (!name) {
        ResponseHandler.badRequest(res, "Store name is required");
        return;
      }

      const store = await StoreService.getStoreByName(name);

      if (!store) {
        ResponseHandler.notFound(res, "Store not found");
        return;
      }

      ResponseHandler.success(res, store, "Store retrieved successfully");
    } catch (err) {
      next(err);
    }
  }

  static async searchStores(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = storeQuerySchema.parse(req.query);
      
      if (!query.search) {
        ResponseHandler.badRequest(res, "Search term is required");
        return;
      }

      const { page, limit } = PaginationHelper.parseParams({
        page: query.page,
        limit: query.limit,
      });

      const result = await StoreService.searchStores(query.search, page, limit);

      ResponseHandler.successWithPagination(
        res,
        result.data,
        result.pagination,
        "Search results retrieved successfully"
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid query parameters", err.flatten());
        return;
      }
      next(err);
    }
  }

  static async getStoresByLetter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = storeQuerySchema.parse(req.query);
      
      if (!query.letter) {
        ResponseHandler.badRequest(res, "Letter parameter is required");
        return;
      }

      const { page, limit } = PaginationHelper.parseParams({
        page: query.page,
        limit: query.limit,
      });

      const result = await StoreService.getStoresByLetter(
        query.letter,
        page,
        limit
      );

      ResponseHandler.successWithPagination(
        res,
        result.data,
        result.pagination,
        `Stores starting with '${query.letter}' retrieved successfully`
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        ResponseHandler.badRequest(res, "Invalid query parameters", err.flatten());
        return;
      }
      next(err);
    }
  }
}

