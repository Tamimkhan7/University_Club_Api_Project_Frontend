import api from "./axios";

const unwrap = (res, fallback) => {
  const body = res.data;
  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }
  return body;
};

export const recruitmentApi = {
  // POST /api/recruitment/clubs/{clubId}/apply
  apply: async (clubId, dto = {}) => {
    const res = await api.post(`/recruitment/clubs/${clubId}/apply`, dto);
    return unwrap(res, "Failed to submit application.");
  },

  // DELETE /api/recruitment/{applicationId}
  withdraw: async (applicationId) => {
    const res = await api.delete(`/recruitment/${applicationId}`);
    return unwrap(res, "Failed to withdraw application.");
  },

  // GET /api/recruitment/my?page=&pageSize=
  getMyApplications: async ({ page = 1, pageSize = 10 } = {}) => {
    const res = await api.get(`/recruitment/my`, { params: { page, pageSize } });
    return unwrap(res, "Failed to load your applications.");
  },

  // GET /api/recruitment/clubs/{clubId}?status=&page=&pageSize=
  getClubApplications: async (clubId, { status, page = 1, pageSize = 10 } = {}) => {
    const params = { page, pageSize };
    if (status !== undefined && status !== null && status !== "") {
      params.status = status;
    }
    const res = await api.get(`/recruitment/clubs/${clubId}`, { params });
    return unwrap(res, "Failed to load applications.");
  },

  // PUT /api/recruitment/{applicationId}/approve
  approve: async (applicationId, dto = {}) => {
    const res = await api.put(`/recruitment/${applicationId}/approve`, dto);
    return unwrap(res, "Failed to approve application.");
  },

  // PUT /api/recruitment/{applicationId}/reject
  reject: async (applicationId, dto = {}) => {
    const res = await api.put(`/recruitment/${applicationId}/reject`, dto);
    return unwrap(res, "Failed to reject application.");
  },

  // GET /api/recruitment/clubs/{clubId}/pending-count
  getPendingCount: async (clubId) => {
    const res = await api.get(`/recruitment/clubs/${clubId}/pending-count`);
    return unwrap(res, "Failed to load pending count.");
  },
};

export default recruitmentApi;
