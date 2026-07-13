import axios from "axios";

// Backend runs on http://localhost:5000 (see launchSettings.json -> "http" profile)
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor - attach JWT + let the browser set multipart boundaries
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only force JSON content-type when we are NOT sending FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * IMPORTANT: Most endpoints in this API wrap their payload like:
 *   { success: true, message: "...", data: <actual payload> }
 * (see Helpers/ApiResponse.cs)
 *
 * A few Auth endpoints (login, register, refresh-token, me) return the
 * raw payload directly instead of wrapping it.
 *
 * To avoid having to write `res.data.data` everywhere in every page, we
 * unwrap automatically here whenever the response looks like the standard
 * envelope. After this runs, `res.data` is always the real payload.
 */
api.interceptors.response.use(
  (response) => {
    // A couple of backend endpoints accidentally wrap the ApiResponse envelope
    // twice: { success, message, data: { success, message, data } }.
    // Loop-unwrap so callers always get the real payload either way.
    let body = response.data;
    let unwrapped = false;
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
  async (error) => {
    const original = error.config;

    if (error.code === "ERR_NETWORK") {
      console.error("Cannot connect to backend at " + API_BASE_URL);
    }

    // Try a silent refresh once on 401 (except for the auth endpoints themselves)
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
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Small helper: extract a readable error message from any axios error
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === "string") return error.response.data;
  if (error?.code === "ERR_NETWORK")
    return "Cannot connect to backend. Make sure it is running on http://localhost:5000";
  return error?.message || fallback;
};

export default api;
