import api from "./axios";
import { unwrap } from "./apiUtils";

export const liveEventApi = {
  start: async (eventId, meetingLink) => {
    const res = await api.post(`/live-events/${eventId}/start`, { meetingLink });
    return unwrap(res, "Failed to start live session.");
  },

  end: async (eventId) => {
    const res = await api.put(`/live-events/${eventId}/end`);
    return unwrap(res, "Failed to end live session.");
  },

  getStatus: async (eventId) => {
    const res = await api.get(`/live-events/${eventId}/status`);
    return unwrap(res, "Failed to load live status.");
  },

  getChatHistory: async (eventId, { page = 1, pageSize = 30 } = {}) => {
    const res = await api.get(`/live-events/${eventId}/chat`, { params: { page, pageSize } });
    return unwrap(res, "Failed to load chat history.");
  },

  getActiveViewers: async (eventId) => {
    const res = await api.get(`/live-events/${eventId}/viewers`);
    return unwrap(res, "Failed to load active viewers.");
  },

  muteUser: async (eventId, userId, mute) => {
    const res = await api.put(`/live-events/${eventId}/moderation/${userId}/mute`, { mute });
    return unwrap(res, "Failed to update mute status.");
  },

  kickUser: async (eventId, userId, ban = false) => {
    const res = await api.post(`/live-events/${eventId}/moderation/${userId}/kick`, { ban });
    return unwrap(res, "Failed to kick user.");
  },

  unbanUser: async (eventId, userId) => {
    const res = await api.post(`/live-events/${eventId}/moderation/${userId}/unban`);
    return unwrap(res, "Failed to unban user.");
  },
};

export default liveEventApi;
