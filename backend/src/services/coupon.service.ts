import { db } from "../config/database.js";
import { PaginationHelper, PaginationResult } from "../utils/pagination.js";
import type {
  CouponWithStore,
  CouponFilters,
  StoreCouponsResponse,
  CreateCouponInput,
} from "../types/coupon.types.js";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

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
          updatedAt: true,
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
          updatedAt: "desc",
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
        updatedAt: true,
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
          updatedAt: true,
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
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.coupon.count({ where: { storeId } }),
    ]);

    return PaginationHelper.createResult(coupons, page, limit, totalCount);
  }

  static async createCoupon(
    input: CreateCouponInput
  ): Promise<CouponWithStore> {
    const { storeName, code, description, storeLink } = input;
    let { platformId } = input;

    // If no platformId provided, get or create a default platform
    if (!platformId) {
      let defaultPlatform = await db.platform.findFirst({
        where: { name: "Web" },
      });

      if (!defaultPlatform) {
        // Create default platform if it doesn't exist
        const platformIdNew = randomUUID();
        defaultPlatform = await db.platform.create({
          data: {
            id: platformIdNew,
            name: "Web",
            version: 1,
          },
        });
      }

      platformId = defaultPlatform.id;
    }

    // Check if store exists, if not create it
    let store = await db.store.findFirst({
      where: {
        name: {
          equals: storeName,
          mode: "insensitive",
        },
        platformId,
      },
    });

    if (!store) {
      // Create new store if it doesn't exist
      const storeId = randomUUID();
      store = await db.store.create({
        data: {
          id: storeId,
          name: storeName,
          link:
            storeLink ||
            `https://${storeName.toLowerCase().replace(/\s+/g, "")}.com`,
          platformId,
        },
      });
    }

    // Check if coupon with same code already exists for this store
    const existingCoupon = await db.coupon.findUnique({
      where: {
        code_storeId: {
          code,
          storeId: store.id,
        },
      },
    });

    if (existingCoupon) {
      throw new Error("Coupon with this code already exists for this store");
    }

    // Create the coupon
    const couponId = randomUUID();
    const coupon = await db.coupon.create({
      data: {
        id: couponId,
        code,
        storeId: store.id,
        platformId,
        details: description || null,
        version: 1,
      },
      select: {
        id: true,
        code: true,
        version: true,
        storeId: true,
        platformId: true,
        details: true,
        updatedAt: true,
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
