import api from "./axios";
import { unwrap } from "./apiUtils";

const MAX_BULK_SIZE = 100;

export const presenceApi = {
  getStatus: async (userId) => {
    const res = await api.get(`/presence/users/${userId}`);
    return unwrap(res, "Failed to load presence status.");
  },

  getBulkStatus: async (userIds) => {
    const distinctIds = Array.from(new Set(userIds || [])).slice(0, MAX_BULK_SIZE);
    if (distinctIds.length === 0) return [];
    const res = await api.post("/presence/users/bulk", { userIds: distinctIds });
    return unwrap(res, "Failed to load presence statuses.");
  },

 
  getOnlineFollowing: async (page = 1, pageSize = 50) => {
    const res = await api.get("/presence/online-following", { params: { page, pageSize } });
    const body = unwrap(res, "Failed to load online connections.");
    return body?.items || [];
  },
};

export default presenceApi;