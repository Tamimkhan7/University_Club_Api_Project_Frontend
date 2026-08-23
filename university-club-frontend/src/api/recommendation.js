import api from "./axios";
import { unwrap } from "./apiUtils";

export const recommendationApi = {
  getClubs: async (count = 10) => {
    const res = await api.get("/recommendations/clubs", { params: { count } });
    return unwrap(res, "Failed to load club recommendations.");
  },

  getEvents: async (count = 10) => {
    const res = await api.get("/recommendations/events", { params: { count } });
    return unwrap(res, "Failed to load event recommendations.");
  },

  getPeople: async (count = 10) => {
    const res = await api.get("/recommendations/people", { params: { count } });
    return unwrap(res, "Failed to load people recommendations.");
  },

  dismissClub: async (clubId) => {
    const res = await api.post(`/recommendations/clubs/${clubId}/dismiss`);
    return unwrap(res, "Failed to dismiss recommendation.");
  },

  runSmartDigest: async () => {
    const res = await api.post("/recommendations/smart-digest");
    return unwrap(res, "Failed to generate smart digest.");
  },
};

export default recommendationApi;
