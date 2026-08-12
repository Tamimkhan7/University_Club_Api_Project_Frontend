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

// Mirrors backend UniversityClubAPI.Enums.LeaderboardCategory
export const LeaderboardCategory = {
  Overall: "Overall",
  Posts: "Posts",
  Events: "Events",
  Badges: "Badges",
  Followers: "Followers",
};

// Mirrors backend UniversityClubAPI.Enums.LeaderboardPeriod
export const LeaderboardPeriod = {
  AllTime: "AllTime",
  Monthly: "Monthly",
  Weekly: "Weekly",
};

export const leaderboardApi = {
  // GET /api/leaderboard?category=&period=&count=
  getLeaderboard: async (
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime,
    count = 20
  ) => {
    const res = await api.get("/leaderboard", { params: { category, period, count } });
    return unwrap(res, "Failed to load leaderboard.");
  },

  // GET /api/leaderboard/me?category=&period=
  getMyRank: async (
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime
  ) => {
    const res = await api.get("/leaderboard/me", { params: { category, period } });
    return unwrap(res, "Failed to load your rank.");
  },

  // GET /api/leaderboard/user/{userId}?category=&period= (ModeratorOnly on backend)
  getUserRank: async (
    userId,
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime
  ) => {
    const res = await api.get(`/leaderboard/user/${userId}`, { params: { category, period } });
    return unwrap(res, "Failed to load user's rank.");
  },

  // GET /api/leaderboard/insight?category=&period= — Gemini-powered tip
  getInsight: async (
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime
  ) => {
    const res = await api.get("/leaderboard/insight", { params: { category, period } });
    return unwrap(res, "Failed to load leaderboard insight.");
  },
};

export default leaderboardApi;