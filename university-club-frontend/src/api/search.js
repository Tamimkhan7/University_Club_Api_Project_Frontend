import api from "./axios";
import { unwrap } from "./apiUtils";

export const SearchEntityType = {
  Users: "Users",
  Clubs: "Clubs",
  Posts: "Posts",
  Events: "Events",
  Groups: "Groups",
  Files: "Files",
};

export const SearchSortBy = {
  Relevance: "Relevance",
  Newest: "Newest",
  Oldest: "Oldest",
  Popular: "Popular",
};

export const searchApi = {
  globalSearch: async (query, limitPerType = 5) => {
    const res = await api.get("/search/global", { params: { query, limitPerType } });
    return unwrap(res, "Failed to search.");
  },

  advancedSearch: async ({
    type,
    query = "",
    clubId,
    fromDate,
    toDate,
    sortBy = SearchSortBy.Relevance,
    page = 1,
    pageSize = 10,
  } = {}) => {
    const res = await api.get("/search/advanced", {
      params: { type, query, clubId, fromDate, toDate, sortBy, page, pageSize },
    });
    return unwrap(res, "Failed to load search results.");
  },

  getSuggestions: async (query, count = 8) => {
    const res = await api.get("/search/suggestions", { params: { query, count } });
    return unwrap(res, "Failed to load suggestions.");
  },

  getTrending: async (days = 7, count = 10) => {
    const res = await api.get("/search/trending", { params: { days, count } });
    return unwrap(res, "Failed to load trending searches.");
  },

  getRecent: async (count = 10) => {
    const res = await api.get("/search/recent", { params: { count } });
    return unwrap(res, "Failed to load recent searches.");
  },

  deleteRecent: async (historyId) => {
    const res = await api.delete(`/search/recent/${historyId}`);
    return unwrap(res, "Failed to remove search.");
  },

  clearRecent: async () => {
    const res = await api.delete("/search/recent");
    return unwrap(res, "Failed to clear search history.");
  },
};

export default searchApi;
