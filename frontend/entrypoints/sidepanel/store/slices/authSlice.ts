import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { authService } from "../../services/auth.service";
import {
  AuthState,
  SignupRequest,
  SigninRequest,
  AuthTokens,
} from "../../types/auth.types";

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  isAuthenticated: !!Cookies.get("accessToken"),
  isLoading: false,
  error: null,
};

// Async thunks
export const signup = createAsyncThunk(
  "auth/signup",
  async (data: SignupRequest, { rejectWithValue }) => {
    try {
      const response = await authService.signup(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  }
);

export const signin = createAsyncThunk(
  "auth/signin",
  async (data: SigninRequest, { rejectWithValue }) => {
    try {
      const response = await authService.signin(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid email or password."
      );
    }
  }
);

export const signout = createAsyncThunk(
  "auth/signout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.signout();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
    setCredentials: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user || null;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.error = null;

        // Store tokens in cookies
        Cookies.set("accessToken", action.payload.accessToken, { expires: 7 });
        Cookies.set("refreshToken", action.payload.refreshToken, {
          expires: 30,
        });
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Signin
    builder
      .addCase(signin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.error = null;

        // Store tokens in cookies
        Cookies.set("accessToken", action.payload.accessToken, { expires: 7 });
        Cookies.set("refreshToken", action.payload.refreshToken, {
          expires: 30,
        });
      })
      .addCase(signin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Signout
    builder
      .addCase(signout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;

        // Remove tokens from cookies
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
      })
      .addCase(signout.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearError, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
