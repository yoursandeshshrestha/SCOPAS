import apiClient from "../config/api";
import Cookies from "js-cookie";
import {
  SignupRequest,
  SigninRequest,
  AuthResponse,
} from "../types/auth.types";

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);
    return response.data;
  },

  signin: async (data: SigninRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signin", data);
    return response.data;
  },

  signout: async (): Promise<void> => {
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refreshToken });
      } catch (error) {
        // Even if the request fails, we'll still clear local tokens
        console.error("Logout request failed:", error);
      }
    }
  },

  getCurrentUser: async () => {
    // Add get current user endpoint if available in backend
    // const response = await apiClient.get('/auth/me');
    // return response.data;
  },
};
