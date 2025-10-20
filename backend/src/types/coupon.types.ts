export interface Coupon {
  id: string;
  code: string | null;
  version: number | null;
  storeId: string;
  platformId: string;
  details: string | null;
  updatedAt: Date;
}

export interface CouponWithStore extends Coupon {
  store: {
    id: string;
    name: string;
    link: string;
  };
  platform: {
    id: string;
    name: string;
  };
}

export interface CouponFilters {
  storeName?: string;
  platformId?: string;
}

export interface GetCouponsParams extends CouponFilters {
  page?: number;
  limit?: number;
}

export interface StoreCouponsResponse {
  [platformName: string]: string[];
}

export interface CreateCouponInput {
  storeName: string;
  code: string;
  description?: string;
  platformId?: string;
  storeLink?: string;
}
