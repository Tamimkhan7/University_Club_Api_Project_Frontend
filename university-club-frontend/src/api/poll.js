import api from "./axios";
import { unwrap } from "./apiUtils";

export const pollApi = {
  create: async (clubId, dto) => {
    const res = await api.post(`/polls/clubs/${clubId}`, dto);
    return unwrap(res, "Failed to create poll.");
  },

  getClubPolls: async (clubId, { activeOnly = false, page = 1, pageSize = 10 } = {}) => {
    const res = await api.get(`/polls/clubs/${clubId}`, {
      params: { activeOnly, page, pageSize },
    });
    return unwrap(res, "Failed to load polls.");
  },

  getById: async (pollId) => {
    const res = await api.get(`/polls/${pollId}`);
    return unwrap(res, "Failed to load poll.");
  },

  vote: async (pollId, optionIds) => {
    const res = await api.post(`/polls/${pollId}/vote`, { optionIds });
    return unwrap(res, "Failed to submit vote.");
  },

  close: async (pollId) => {
    const res = await api.put(`/polls/${pollId}/close`);
    return unwrap(res, "Failed to close poll.");
  },

  remove: async (pollId) => {
    const res = await api.delete(`/polls/${pollId}`);
    return unwrap(res, "Failed to delete poll.");
  },
};

export default pollApi;
