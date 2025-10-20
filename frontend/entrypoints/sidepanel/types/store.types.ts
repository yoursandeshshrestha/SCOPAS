export interface Store {
  id: string;
  name: string;
  link: string;
  platformId: string;
  logo?: string;
  coupons: Coupon[];
}

export interface Coupon {
  id: string;
  code: string | null;
  details: string | null;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StoresResponse {
  status: "success";
  data: Store[];
  meta: PaginationMeta;
  message?: string;
}

export interface GetStoresParams {
  page?: number;
  limit?: number;
  search?: string;
  letter?: string;
}
