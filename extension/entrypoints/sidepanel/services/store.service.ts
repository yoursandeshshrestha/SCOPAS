import apiClient from "../config/api";
import { StoresResponse, GetStoresParams, Store } from "../types/store.types";

export const storeService = {
  getAllStores: async (params?: GetStoresParams): Promise<StoresResponse> => {
    const response = await apiClient.get<StoresResponse>("/stores", { params });
    return response.data;
  },

  getStoreById: async (
    id: string
  ): Promise<{ status: string; data: Store }> => {
    const response = await apiClient.get<{ status: string; data: Store }>(
      `/stores/${id}`
    );
    return response.data;
  },

  searchStores: async (
    search: string,
    page?: number,
    limit?: number
  ): Promise<StoresResponse> => {
    const response = await apiClient.get<StoresResponse>("/stores", {
      params: { search, page, limit },
    });
    return response.data;
  },
};
