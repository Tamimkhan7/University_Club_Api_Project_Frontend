import api from "./axios";
import { unwrap } from "./apiUtils";

export const recruitmentApi = {
  apply: async (clubId, dto = {}) => {
    const res = await api.post(`/recruitment/clubs/${clubId}/apply`, dto);
    return unwrap(res, "Failed to submit application.");
  },

  withdraw: async (applicationId) => {
    const res = await api.delete(`/recruitment/${applicationId}`);
    return unwrap(res, "Failed to withdraw application.");
  },

  getMyApplications: async ({ page = 1, pageSize = 10 } = {}) => {
    const res = await api.get(`/recruitment/my`, { params: { page, pageSize } });
    return unwrap(res, "Failed to load your applications.");
  },

  getClubApplications: async (clubId, { status, page = 1, pageSize = 10 } = {}) => {
    const params = { page, pageSize };
    if (status !== undefined && status !== null && status !== "") {
      params.status = status;
    }
    const res = await api.get(`/recruitment/clubs/${clubId}`, { params });
    return unwrap(res, "Failed to load applications.");
  },

  approve: async (applicationId, dto = {}) => {
    const res = await api.put(`/recruitment/${applicationId}/approve`, dto);
    return unwrap(res, "Failed to approve application.");
  },

  reject: async (applicationId, dto = {}) => {
    const res = await api.put(`/recruitment/${applicationId}/reject`, dto);
    return unwrap(res, "Failed to reject application.");
  },

  getPendingCount: async (clubId) => {
    const res = await api.get(`/recruitment/clubs/${clubId}/pending-count`);
    return unwrap(res, "Failed to load pending count.");
  },
};

export default recruitmentApi;
