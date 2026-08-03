import api from "./axios";

const unwrap = (res, fallback) => {
  const body = res.data;
  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }
  return body;
};

export const liveEventApi = {
  // POST /api/live-events/{eventId}/start   body: { meetingLink }
  start: async (eventId, meetingLink) => {
    const res = await api.post(`/live-events/${eventId}/start`, { meetingLink });
    return unwrap(res, "Failed to start live session.");
  },

  // PUT /api/live-events/{eventId}/end
  end: async (eventId) => {
    const res = await api.put(`/live-events/${eventId}/end`);
    return unwrap(res, "Failed to end live session.");
  },

  // GET /api/live-events/{eventId}/status
  getStatus: async (eventId) => {
    const res = await api.get(`/live-events/${eventId}/status`);
    return unwrap(res, "Failed to load live status.");
  },

  // GET /api/live-events/{eventId}/chat?page=&pageSize=
  getChatHistory: async (eventId, { page = 1, pageSize = 30 } = {}) => {
    const res = await api.get(`/live-events/${eventId}/chat`, { params: { page, pageSize } });
    return unwrap(res, "Failed to load chat history.");
  },

  // GET /api/live-events/{eventId}/viewers
  getActiveViewers: async (eventId) => {
    const res = await api.get(`/live-events/${eventId}/viewers`);
    return unwrap(res, "Failed to load active viewers.");
  },

  // PUT /api/live-events/{eventId}/moderation/{userId}/mute   body: { mute }
  muteUser: async (eventId, userId, mute) => {
    const res = await api.put(`/live-events/${eventId}/moderation/${userId}/mute`, { mute });
    return unwrap(res, "Failed to update mute status.");
  },

  // POST /api/live-events/{eventId}/moderation/{userId}/kick   body: { ban }
  kickUser: async (eventId, userId, ban = false) => {
    const res = await api.post(`/live-events/${eventId}/moderation/${userId}/kick`, { ban });
    return unwrap(res, "Failed to kick user.");
  },

  // POST /api/live-events/{eventId}/moderation/{userId}/unban
  unbanUser: async (eventId, userId) => {
    const res = await api.post(`/live-events/${eventId}/moderation/${userId}/unban`);
    return unwrap(res, "Failed to unban user.");
  },
};

export default liveEventApi;
