import api from "./axios";
import { unwrap } from "./apiUtils";

export const LeaderboardCategory = {
  Overall: "Overall",
  Posts: "Posts",
  Events: "Events",
  Badges: "Badges",
  Followers: "Followers",
};

export const LeaderboardPeriod = {
  AllTime: "AllTime",
  Monthly: "Monthly",
  Weekly: "Weekly",
};

export const leaderboardApi = {
  getLeaderboard: async (
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime,
    count = 20
  ) => {
    const res = await api.get("/leaderboard", { params: { category, period, count } });
    return unwrap(res, "Failed to load leaderboard.");
  },

  getMyRank: async (
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime
  ) => {
    const res = await api.get("/leaderboard/me", { params: { category, period } });
    return unwrap(res, "Failed to load your rank.");
  },

  getUserRank: async (
    userId,
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime
  ) => {
    const res = await api.get(`/leaderboard/user/${userId}`, { params: { category, period } });
    return unwrap(res, "Failed to load user's rank.");
  },

  getInsight: async (
    category = LeaderboardCategory.Overall,
    period = LeaderboardPeriod.AllTime
  ) => {
    const res = await api.get("/leaderboard/insight", { params: { category, period } });
    return unwrap(res, "Failed to load leaderboard insight.");
  },
};

export default leaderboardApi;