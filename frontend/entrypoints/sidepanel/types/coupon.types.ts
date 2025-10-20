export interface Coupon {
  id: string;
  code: string | null;
  version: number | null;
  storeId: string;
  platformId: string;
  details: string | null;
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

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CouponsResponse {
  status: "success";
  data: CouponWithStore[];
  meta: PaginationMeta;
  message?: string;
}

export interface GetCouponsParams {
  page?: number;
  limit?: number;
  storeName?: string;
  platformId?: string;
}

export interface StoreCouponsResponse {
  status: "success";
  data: {
    [platformName: string]: string[];
  };
  message?: string;
}
