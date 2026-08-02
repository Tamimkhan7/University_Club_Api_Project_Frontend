import api from "./axios";

// NOTE: the shared axios response interceptor (see ./axios.js) already
// unwraps the backend's ApiResponse<T> envelope ({ success, message, data })
// down to just `data` whenever both `success` and `data` keys are present.
// On a *logical* failure (still HTTP 200, e.g. ApiResponse.Fail("Story not
// found.")) that leaves `data` (and therefore res.data) as `null`, so we
// can't recover the original message here - we fall back to a sensible
// default message instead, same convention used by ../api/poll.js.
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
  // POST /api/stories (multipart/form-data: Media, Caption)
  create: async (file, caption) => {
    const formData = new FormData();
    formData.append("Media", file);
    if (caption) formData.append("Caption", caption);

    const res = await api.post("/stories", formData);
    return unwrap(res, "Failed to post story.");
  },

  // GET /api/stories/feed -> stories grouped by user (people I follow + me)
  getFeed: async () => {
    const res = await api.get("/stories/feed");
    return unwrap(res, "Failed to load stories.");
  },

  // GET /api/stories/my
  getMy: async () => {
    const res = await api.get("/stories/my");
    return unwrap(res, "Failed to load your stories.");
  },

  // GET /api/stories/user/{targetUserId}
  getUserStories: async (targetUserId) => {
    const res = await api.get(`/stories/user/${targetUserId}`);
    return unwrap(res, "Failed to load stories.");
  },

  // POST /api/stories/{storyId}/view
  view: async (storyId) => {
    const res = await api.post(`/stories/${storyId}/view`);
    return unwrap(res, "Failed to mark story as viewed.");
  },

  // GET /api/stories/{storyId}/viewers (owner only)
  getViewers: async (storyId) => {
    const res = await api.get(`/stories/${storyId}/viewers`);
    return unwrap(res, "Failed to load viewers.");
  },

  // DELETE /api/stories/{storyId}
  remove: async (storyId) => {
    const res = await api.delete(`/stories/${storyId}`);
    return unwrap(res, "Failed to delete story.");
  },
};

export default storyApi;
