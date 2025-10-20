import { PaginationMeta } from "./responseHandler.js";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export class PaginationHelper {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;

  static parseParams(params: PaginationParams): PaginationOptions {
    const page = Math.max(1, parseInt(String(params.page || this.DEFAULT_PAGE), 10));
    const limit = Math.min(
      Math.max(1, parseInt(String(params.limit || this.DEFAULT_LIMIT), 10)),
      this.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static createMeta(
    page: number,
    limit: number,
    totalItems: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  static createResult<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number
  ): PaginationResult<T> {
    return {
      data,
      pagination: this.createMeta(page, limit, totalItems),
    };
  }
}

