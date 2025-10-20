import apiClient from "../config/api";
import {
  CouponsResponse,
  GetCouponsParams,
  CouponWithStore,
  StoreCouponsResponse,
} from "../types/coupon.types";

export const couponService = {
  getAllCoupons: async (
    params?: GetCouponsParams
  ): Promise<CouponsResponse> => {
    const response = await apiClient.get<CouponsResponse>("/coupons", {
      params,
    });
    return response.data;
  },

  getCouponById: async (
    id: string
  ): Promise<{ status: string; data: CouponWithStore }> => {
    const response = await apiClient.get<{
      status: string;
      data: CouponWithStore;
    }>(`/coupons/${id}`);
    return response.data;
  },

  getCouponsByStoreName: async (
    storeName: string
  ): Promise<StoreCouponsResponse> => {
    const response = await apiClient.post<StoreCouponsResponse>(
      "/coupons/by-store",
      {
        name: storeName,
      }
    );
    return response.data;
  },

  getCouponsByStoreId: async (
    storeId: string,
    page?: number,
    limit?: number
  ): Promise<CouponsResponse> => {
    const response = await apiClient.get<CouponsResponse>(
      `/coupons/store/${storeId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },
};
