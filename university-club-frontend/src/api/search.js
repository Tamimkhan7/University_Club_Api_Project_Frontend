import api from "./axios";

// NOTE: same convention as ../api/poll.js, ../api/recommendation.js and
// ../api/story.js — the shared axios response interceptor (see ./axios.js)
// already unwraps the backend's ApiResponse<T> envelope
// ({ success, message, data }) down to just `data` whenever both `success`
// and `data` keys are present. On a *logical* failure (still HTTP 200, e.g.
// ApiResponse.Fail("Search query cannot be empty.")) that leaves `data`
// (and therefore res.data) as `null`/`undefined`, so we fall back to a
// sensible default message instead.
const unwrap = (res, fallback) => {
  const body = res.data;

  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }

  return body;
};

// Mirrors UniversityClubAPI.Enums.SearchEntityType — sent to the backend by
// name (ASP.NET model binding accepts enum member names in query strings).
export const SearchEntityType = {
  Users: "Users",
  Clubs: "Clubs",
  Posts: "Posts",
  Events: "Events",
  Groups: "Groups",
  Files: "Files",
};

// Mirrors UniversityClubAPI.Enums.SearchSortBy
export const SearchSortBy = {
  Relevance: "Relevance",
  Newest: "Newest",
  Oldest: "Oldest",
  Popular: "Popular",
};

export const searchApi = {
  // GET /api/search/global?query=&limitPerType=
  globalSearch: async (query, limitPerType = 5) => {
    const res = await api.get("/search/global", { params: { query, limitPerType } });
    return unwrap(res, "Failed to search.");
  },

  // GET /api/search/advanced?type=&query=&clubId=&fromDate=&toDate=&sortBy=&page=&pageSize=
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

  // GET /api/search/suggestions?query=&count= (typeahead — call on keystroke)
  getSuggestions: async (query, count = 8) => {
    const res = await api.get("/search/suggestions", { params: { query, count } });
    return unwrap(res, "Failed to load suggestions.");
  },

  // GET /api/search/trending?days=&count=
  getTrending: async (days = 7, count = 10) => {
    const res = await api.get("/search/trending", { params: { days, count } });
    return unwrap(res, "Failed to load trending searches.");
  },

  // GET /api/search/recent?count=
  getRecent: async (count = 10) => {
    const res = await api.get("/search/recent", { params: { count } });
    return unwrap(res, "Failed to load recent searches.");
  },

  // DELETE /api/search/recent/{historyId}
  deleteRecent: async (historyId) => {
    const res = await api.delete(`/search/recent/${historyId}`);
    return unwrap(res, "Failed to remove search.");
  },

  // DELETE /api/search/recent
  clearRecent: async () => {
    const res = await api.delete("/search/recent");
    return unwrap(res, "Failed to clear search history.");
  },
};

export default searchApi;
