import { db } from "../config/database.js";
import { PaginationHelper, PaginationResult } from "../utils/pagination.js";
import type { StoreWithCoupons, StoreFilters } from "../types/store.types.js";
import type { Prisma } from "@prisma/client";

export class StoreService {
  static async getAllStores(
    filters: StoreFilters,
    page: number,
    limit: number
  ): Promise<PaginationResult<StoreWithCoupons>> {
    const { skip } = PaginationHelper.parseParams({ page, limit });
    const whereClause = this.buildWhereClause(filters);

    // Add condition to only include stores with at least one coupon
    const finalWhereClause: Prisma.storeWhereInput = {
      ...whereClause,
      coupon: {
        some: {},
      },
    };

    const [stores, totalCount] = await Promise.all([
      db.store.findMany({
        where: finalWhereClause,
        select: {
          id: true,
          name: true,
          link: true,
          platformId: true,
          coupon: {
            select: {
              id: true,
              code: true,
              details: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      }),
      db.store.count({ where: finalWhereClause }),
    ]);

    const mappedStores: StoreWithCoupons[] = stores.map((store) => ({
      id: store.id,
      name: store.name || "Unlisted Store",
      link: store.link,
      platformId: store.platformId,
      coupons: store.coupon,
    }));

    return PaginationHelper.createResult(mappedStores, page, limit, totalCount);
  }

  static async getStoreById(id: string): Promise<StoreWithCoupons | null> {
    const store = await db.store.findFirst({
      where: {
        id,
        coupon: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        link: true,
        platformId: true,
        coupon: {
          select: {
            id: true,
            code: true,
            details: true,
          },
        },
      },
    });

    if (!store) return null;

    return {
      id: store.id,
      name: store.name || "Unlisted Store",
      link: store.link,
      platformId: store.platformId,
      coupons: store.coupon,
    };
  }

  static async getStoreByName(name: string): Promise<StoreWithCoupons | null> {
    const store = await db.store.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        coupon: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        link: true,
        platformId: true,
        coupon: {
          select: {
            id: true,
            code: true,
            details: true,
          },
        },
      },
    });

    if (!store) return null;

    return {
      id: store.id,
      name: store.name || "Unlisted Store",
      link: store.link,
      platformId: store.platformId,
      coupons: store.coupon,
    };
  }

  static async searchStores(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<StoreWithCoupons>> {
    return this.getAllStores({ search: searchTerm }, page, limit);
  }

  static async getStoresByLetter(
    letter: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<StoreWithCoupons>> {
    return this.getAllStores({ letter }, page, limit);
  }

  private static buildWhereClause(
    filters: StoreFilters
  ): Prisma.storeWhereInput {
    const whereClause: Prisma.storeWhereInput = {};

    // If both search and letter are provided, prioritize search
    if (filters.search) {
      whereClause.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    } else if (filters.letter) {
      whereClause.name = {
        startsWith: filters.letter,
        mode: "insensitive",
      };
    }

    return whereClause;
  }
}
