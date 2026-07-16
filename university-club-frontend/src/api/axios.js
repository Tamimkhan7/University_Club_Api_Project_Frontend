/**
 * ============================================================
 *  🚀 API Client Module
 *  Enterprise-Grade Axios Configuration
 *  Designed for Scale, Security & Developer Experience
 * ============================================================
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🔐 Authentication Flow                                    │
 *  │  • JWT Token Interceptor                                   │
 *  │  • Silent Token Refresh (401 handling)                     │
 *  │  • Secure Token Storage (localStorage)                     │
 *  ├─────────────────────────────────────────────────────────────┤
 *  │  📦 Response Unwrapping                                    │
 *  │  • Automatic ApiResponse Envelope Extraction               │
 *  │  • Handles Double-Wrapped Responses                        │
 *  ├─────────────────────────────────────────────────────────────┤
 *  │  🌐 Network Resilience                                     │
 *  │  • 30s Timeout Protection                                  │
 *  │  • Connection Error Handling                               │
 *  │  • User-Friendly Error Messages                            │
 *  └─────────────────────────────────────────────────────────────┘
 *
 *  ⚡ Backend URL: http://localhost:5000/api
 *  📌 Profile: launchSettings.json → "http" profile
 * ============================================================
 */

import axios from "axios";

// ──────────────────────────────────────────────────────────────
//  📍 API Base Configuration
// ──────────────────────────────────────────────────────────────

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds — enough for heavy operations
  headers: {
    Accept: "application/json",
  },
});

// ──────────────────────────────────────────────────────────────
//  🔑 Request Interceptor — JWT & Content-Type Management
// ──────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // 1. Attach Bearer Token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Let the browser manage multipart boundaries for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────────────────────
//  📦 Response Interceptor — Smart Envelope Unwrapping
// ──────────────────────────────────────────────────────────────
//
//  🎯 Most endpoints wrap payloads in:
//     { success: true, message: "...", data: <actual payload> }
//
//  🎯 Some auth endpoints (login, register, refresh, me)
//     return raw payload directly.
//
//  🎯 A few endpoints accidentally wrap twice:
//     { success, message, data: { success, message, data } }
//
//  ✅ This interceptor handles ALL cases automatically.
//     After this runs, `res.data` is ALWAYS the real payload.
// ──────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    let body = response.data;
    let unwrapped = false;

    // Loop-unwrap until we reach the actual data
    while (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      Object.prototype.hasOwnProperty.call(body, "success") &&
      Object.prototype.hasOwnProperty.call(body, "data")
    ) {
      body = body.data;
      unwrapped = true;
    }

    if (unwrapped) {
      response.data = body;
    }

    return response;
  },

  // ──────────────────────────────────────────────────────────────
  //  🔄 Silent Refresh on 401 (Except Auth Endpoints)
  // ──────────────────────────────────────────────────────────────

  async (error) => {
    const original = error.config;

    // Network connectivity error
    if (error.code === "ERR_NETWORK") {
      console.error(`🔌 Cannot connect to backend at ${API_BASE_URL}`);
    }

    // Attempt silent refresh once on 401
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !original?.url?.includes("/auth/login") &&
      !original?.url?.includes("/auth/refresh-token")
    ) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefresh } = res.data;

          localStorage.setItem("accessToken", accessToken);
          if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        } catch (refreshErr) {
          // Refresh failed — clear session and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        }
      } else {
        // No refresh token — clear session and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────────────────────
//  🧰 Error Message Helper — User-Friendly & Robust
// ──────────────────────────────────────────────────────────────

export const getErrorMessage = (
  error,
  fallback = "Something went wrong"
) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === "string") return error.response.data;
  if (error?.code === "ERR_NETWORK") {
    return "Cannot connect to backend. Make sure it is running on http://localhost:5000";
  }
  return error?.message || fallback;
};

// ──────────────────────────────────────────────────────────────
//  📤 Export — Ready for Consumption
// ──────────────────────────────────────────────────────────────

export default api;