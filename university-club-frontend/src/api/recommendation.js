import api from "./axios";

// NOTE: same convention as ../api/poll.js and ../api/story.js — the shared
// axios response interceptor (see ./axios.js) already unwraps the backend's
// ApiResponse<T> envelope ({ success, message, data }) down to just `data`
// whenever both `success` and `data` keys are present. On a *logical*
// failure (still HTTP 200, e.g. ApiResponse.Fail("User not found.")) that
// leaves `data` (and therefore res.data) as `null`, so we fall back to a
// sensible default message instead.
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

export const recommendationApi = {
  // GET /api/recommendations/clubs?count=
  getClubs: async (count = 10) => {
    const res = await api.get("/recommendations/clubs", { params: { count } });
    return unwrap(res, "Failed to load club recommendations.");
  },

  // GET /api/recommendations/events?count=
  getEvents: async (count = 10) => {
    const res = await api.get("/recommendations/events", { params: { count } });
    return unwrap(res, "Failed to load event recommendations.");
  },

  // GET /api/recommendations/people?count=
  getPeople: async (count = 10) => {
    const res = await api.get("/recommendations/people", { params: { count } });
    return unwrap(res, "Failed to load people recommendations.");
  },

  // POST /api/recommendations/clubs/{clubId}/dismiss
  dismissClub: async (clubId) => {
    const res = await api.post(`/recommendations/clubs/${clubId}/dismiss`);
    return unwrap(res, "Failed to dismiss recommendation.");
  },

  // POST /api/recommendations/smart-digest
  runSmartDigest: async () => {
    const res = await api.post("/recommendations/smart-digest");
    return unwrap(res, "Failed to generate smart digest.");
  },
};

export default recommendationApi;
