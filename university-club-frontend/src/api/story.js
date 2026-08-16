import api from "./axios";

const unwrap = (res, fallback) => {
  const body = res.data;

  if (body === null || body === undefined) {
    throw new Error(fallback);
  }

  if (typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }

  return body;
};

export const storyApi = {
  create: async (file, caption) => {
    const formData = new FormData();
    formData.append("Media", file);
    if (caption) formData.append("Caption", caption);

    const res = await api.post("/stories", formData);
    return unwrap(res, "Failed to post story.");
  },

  getFeed: async () => {
    const res = await api.get("/stories/feed");
    return unwrap(res, "Failed to load stories.");
  },

  getMy: async () => {
    const res = await api.get("/stories/my");
    return unwrap(res, "Failed to load your stories.");
  },

  getUserStories: async (targetUserId) => {
    const res = await api.get(`/stories/user/${targetUserId}`);
    return unwrap(res, "Failed to load stories.");
  },

  view: async (storyId) => {
    const res = await api.post(`/stories/${storyId}/view`);
    return unwrap(res, "Failed to mark story as viewed.");
  },

  getViewers: async (storyId) => {
    const res = await api.get(`/stories/${storyId}/viewers`);
    return unwrap(res, "Failed to load viewers.");
  },

  remove: async (storyId) => {
    const res = await api.delete(`/stories/${storyId}`);
    return unwrap(res, "Failed to delete story.");
  },
};

export default storyApi;
