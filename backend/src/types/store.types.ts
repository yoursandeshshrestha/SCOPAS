export interface Store {
  id: string;
  name: string;
  link: string;
  platformId: string;
}

export interface StoreWithCoupons extends Store {
  coupons: Array<{
    id: string;
    code: string | null;
    details: string | null;
  }>;
}

export interface StoreFilters {
  letter?: string;
  search?: string;
}

export interface GetStoresParams extends StoreFilters {
  page?: number;
  limit?: number;
}

