import apiClient from "../config/api";
import type {
  UserProfile,
  UpdateProfileRequest,
  UserProfileResponse,
  DeleteAccountResponse,
} from "../types/user.types";

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>("/users/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(
      "/users/profile",
      data
    );
    return response.data;
  },

  deleteAccount: async (): Promise<DeleteAccountResponse> => {
    const response = await apiClient.delete<DeleteAccountResponse>(
      "/users/account"
    );
    return response.data;
  },
};
