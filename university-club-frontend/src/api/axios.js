import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const body = response.data;

    const isApiResponseEnvelope =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      Object.prototype.hasOwnProperty.call(body, "success") &&
      Object.prototype.hasOwnProperty.call(body, "data");

    if (isApiResponseEnvelope && body.success === false) {
      // The backend's controllers always `return Ok(result)`, even when the
      // service layer returned ApiResponse.Fail(...) (wrong permissions,
      // "not found", validation errors, etc). That means a business-logic
      // failure arrives as a normal 2xx HTTP response with { success:false,
      // message, data:null } in the body.
      //
      // Previously this branch didn't exist, so the code below unwrapped
      // straight to `data` (null) and every caller saw a "successful" 2xx
      // response with empty data — actions like starting/ending a live
      // session, muting/kicking a user, joining an event, etc. would look
      // like they worked even when the backend rejected them, and the real
      // error message was silently lost.
      //
      // Rejecting here — with the message attached the same way a real HTTP
      // error would be — means every existing `catch (error) { toast.error(
      // getErrorMessage(error, ...)) }` block across the app now handles
      // soft failures exactly like hard ones, with no other file needing to
      // change.
      const err = new Error(body.message || "Request failed");
      err.response = response;
      err.isApiError = true;
      return Promise.reject(err);
    }

    // Success: unwrap ApiResponse<T> -> T. Only one level is unwrapped
    // (rather than looping) so a legitimate DTO that happens to contain its
    // own "data" field isn't mistaken for another envelope.
    if (isApiResponseEnvelope) {
      response.data = body.data;
    }

    return response;
  },

  async (error) => {
    const original = error.config;

    if (error.code === "ERR_NETWORK") {
      console.error(`🔌 Cannot connect to backend at ${API_BASE_URL}`);
    }

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

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === "string") return error.response.data;
  if (error?.code === "ERR_NETWORK") {
    return "Cannot connect to backend. Make sure it is running on http://localhost:5000";
  }
  return error?.message || fallback;
};

export default api;