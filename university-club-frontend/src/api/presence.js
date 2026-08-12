import api from "./axios";

// NOTE: same convention as ../api/poll.js, ../api/search.js, etc. — the
// shared axios response interceptor (see ./axios.js) already unwraps the
// backend's ApiResponse<T> envelope ({ success, message, data }) down to
// just `data` whenever both `success` and `data` keys are present. On a
// *logical* failure (still HTTP 200, e.g. ApiResponse.Fail("User not
// found.")) that leaves `data` as `null`/`undefined`, so we fall back to a
// sensible default message instead.
const unwrap = (res, fallback) => {
  const body = res.data;

  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }

  return body;
};

const MAX_BULK_SIZE = 100;

export const presenceApi = {
  // GET /api/presence/users/{userId}
  getStatus: async (userId) => {
    const res = await api.get(`/presence/users/${userId}`);
    return unwrap(res, "Failed to load presence status.");
  },

  // POST /api/presence/users/bulk  { userIds: number[] }
  // Backend caps a single request at 100 ids — mirrors that here so a
  // caller with a bigger list doesn't just get a silent 400.
  getBulkStatus: async (userIds) => {
    const distinctIds = Array.from(new Set(userIds || [])).slice(0, MAX_BULK_SIZE);
    if (distinctIds.length === 0) return [];
    const res = await api.post("/presence/users/bulk", { userIds: distinctIds });
    return unwrap(res, "Failed to load presence statuses.");
  },

  // GET /api/presence/online-following?page=&pageSize=
  getOnlineFollowing: async (page = 1, pageSize = 50) => {
    const res = await api.get("/presence/online-following", { params: { page, pageSize } });
    return unwrap(res, "Failed to load online connections.");
  },
};

export default presenceApi;
