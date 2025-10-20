/**
 * Content Script Configuration
 */

export const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:7070/api/v1",
    ENDPOINTS: {
      COUPONS_BY_STORE: "/coupons/by-store",
    },
    TIMEOUT: 10000, // 10 seconds
  },

  // Logging Configuration
  LOGGING: {
    ENABLED: true,
    PREFIX: "[SCOPAS]",
  },

  // Content Script Matching
  MATCHES: {
    INCLUDE: ["*://*/*"],
    EXCLUDE: ["*://localhost/*", "*://127.0.0.1/*"],
  },
} as const;

