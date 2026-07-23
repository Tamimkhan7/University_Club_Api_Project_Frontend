import api from "./axios";

const unwrap = (res, fallback) => {
  const body = res.data;
  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }
  return body;
};

export const pollApi = {
  // POST /api/polls/clubs/{clubId}
  create: async (clubId, dto) => {
    const res = await api.post(`/polls/clubs/${clubId}`, dto);
    return unwrap(res, "Failed to create poll.");
  },

  // GET /api/polls/clubs/{clubId}?activeOnly=&page=&pageSize=
  getClubPolls: async (clubId, { activeOnly = false, page = 1, pageSize = 10 } = {}) => {
    const res = await api.get(`/polls/clubs/${clubId}`, {
      params: { activeOnly, page, pageSize },
    });
    return unwrap(res, "Failed to load polls.");
  },

  // GET /api/polls/{pollId}
  getById: async (pollId) => {
    const res = await api.get(`/polls/${pollId}`);
    return unwrap(res, "Failed to load poll.");
  },

  // POST /api/polls/{pollId}/vote
  vote: async (pollId, optionIds) => {
    const res = await api.post(`/polls/${pollId}/vote`, { optionIds });
    return unwrap(res, "Failed to submit vote.");
  },

  // PUT /api/polls/{pollId}/close
  close: async (pollId) => {
    const res = await api.put(`/polls/${pollId}/close`);
    return unwrap(res, "Failed to close poll.");
  },

  // DELETE /api/polls/{pollId}
  remove: async (pollId) => {
    const res = await api.delete(`/polls/${pollId}`);
    return unwrap(res, "Failed to delete poll.");
  },
};

export default pollApi;
