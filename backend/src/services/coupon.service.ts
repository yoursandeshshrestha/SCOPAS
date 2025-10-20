import { db } from "../config/database.js";
import { PaginationHelper, PaginationResult } from "../utils/pagination.js";
import type {
  CouponWithStore,
  CouponFilters,
  StoreCouponsResponse,
} from "../types/coupon.types.js";
import type { Prisma } from "@prisma/client";

export class CouponService {
  static async getAllCoupons(
    filters: CouponFilters,
    page: number,
    limit: number
  ): Promise<PaginationResult<CouponWithStore>> {
    const { skip } = PaginationHelper.parseParams({ page, limit });
    const whereClause = this.buildWhereClause(filters);

    const [coupons, totalCount] = await Promise.all([
      db.coupon.findMany({
        where: whereClause,
        select: {
          id: true,
          code: true,
          version: true,
          storeId: true,
          platformId: true,
          details: true,
          store: {
            select: {
              id: true,
              name: true,
              link: true,
            },
          },
          platform: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          store: {
            name: "asc",
          },
        },
        skip,
        take: limit,
      }),
      db.coupon.count({ where: whereClause }),
    ]);

    return PaginationHelper.createResult(coupons, page, limit, totalCount);
  }

  static async getCouponById(id: string): Promise<CouponWithStore | null> {
    const coupon = await db.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        version: true,
        storeId: true,
        platformId: true,
        details: true,
        store: {
          select: {
            id: true,
            name: true,
            link: true,
          },
        },
        platform: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return coupon;
  }

  static async getCouponsByStoreName(
    storeName: string
  ): Promise<StoreCouponsResponse> {
    const stores = await db.store.findMany({
      where: {
        name: {
          contains: storeName,
          mode: "insensitive",
        },
      },
      include: {
        coupon: {
          select: {
            code: true,
          },
        },
        platform: {
          select: {
            name: true,
          },
        },
      },
    });

    const storeCoupons: StoreCouponsResponse = stores.reduce((acc, store) => {
      const platformName = store.platform.name;
      const couponCodes = store.coupon
        .map((coupon) => coupon.code)
        .filter((code): code is string => code !== null);

      if (couponCodes.length > 0) {
        acc[platformName] = couponCodes;
      }

      return acc;
    }, {} as StoreCouponsResponse);

    return storeCoupons;
  }

  static async getCouponsByStoreId(
    storeId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<CouponWithStore>> {
    const { skip } = PaginationHelper.parseParams({ page, limit });

    const [coupons, totalCount] = await Promise.all([
      db.coupon.findMany({
        where: { storeId },
        select: {
          id: true,
          code: true,
          version: true,
          storeId: true,
          platformId: true,
          details: true,
          store: {
            select: {
              id: true,
              name: true,
              link: true,
            },
          },
          platform: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      db.coupon.count({ where: { storeId } }),
    ]);

    return PaginationHelper.createResult(coupons, page, limit, totalCount);
  }

  private static buildWhereClause(
    filters: CouponFilters
  ): Prisma.couponWhereInput {
    const whereClause: Prisma.couponWhereInput = {};

    if (filters.storeName) {
      whereClause.store = {
        name: {
          contains: filters.storeName,
          mode: "insensitive",
        },
      };
    }

    if (filters.platformId) {
      whereClause.platformId = filters.platformId;
    }

    return whereClause;
  }
}
