import { useEffect, useState, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/axios";
import leaderboardApi, { LeaderboardCategory, LeaderboardPeriod } from "../api/leaderboard";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Trophy, Medal, Crown, Sparkles, RefreshCw, MessageSquare,
  Calendar, Award, Users, Flame, TrendingUp, Target,
} from "lucide-react";

const CATEGORY_TABS = [
  { id: LeaderboardCategory.Overall, label: "Overall", icon: Trophy },
  { id: LeaderboardCategory.Posts, label: "Posts", icon: MessageSquare },
  { id: LeaderboardCategory.Events, label: "Events", icon: Calendar },
  { id: LeaderboardCategory.Badges, label: "Badges", icon: Award },
  { id: LeaderboardCategory.Followers, label: "Followers", icon: Users },
];

const PERIOD_TABS = [
  { id: LeaderboardPeriod.AllTime, label: "All Time" },
  { id: LeaderboardPeriod.Monthly, label: "Monthly" },
  { id: LeaderboardPeriod.Weekly, label: "Weekly" },
];

const RANK_STYLES = {
  1: "from-amber-400 to-yellow-500 shadow-amber-500/40",
  2: "from-slate-300 to-slate-400 shadow-slate-400/40",
  3: "from-orange-400 to-amber-600 shadow-orange-500/40",
};

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <div
        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${RANK_STYLES[rank]} flex items-center justify-center shadow-lg flex-shrink-0`}
      >
        {rank === 1 ? (
          <Crown className="w-5 h-5 text-white" />
        ) : (
          <Medal className="w-5 h-5 text-white" />
        )}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{rank}</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useContext(AuthContext);
  const [category, setCategory] = useState(LeaderboardCategory.Overall);
  const [period, setPeriod] = useState(LeaderboardPeriod.AllTime);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topEntries, setTopEntries] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const loadLeaderboard = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await leaderboardApi.getLeaderboard(category, period, 20);
      setTopEntries(result?.topEntries || []);
      setMyEntry(result?.myEntry || null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load leaderboard"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, period]);

  const loadInsight = useCallback(async () => {
    setInsightLoading(true);
    try {
      const result = await leaderboardApi.getInsight(category, period);
      setInsight(result);
    } catch (error) {
      setInsight(null);
    } finally {
      setInsightLoading(false);
    }
  }, [category, period]);

  useEffect(() => {
    loadLeaderboard(true);
    loadInsight();
  }, [loadLeaderboard, loadInsight]);

  if (loading) return <Loader />;

  const myRankOutsideTop = myEntry && !topEntries.some((e) => e.userId === myEntry.userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 space-y-6 sm:space-y-8">
        {/* Hero */}
        <div className="page-hero p-6 sm:p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="page-hero-icon">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <span className="text-white/70 text-xs sm:text-sm font-medium flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  Community Standings
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Leaderboard
                </h1>
              </div>
            </div>
            <button
              onClick={() => { loadLeaderboard(false); loadInsight(); }}
              disabled={refreshing}
              className="btn-ghost-dark group disabled:opacity-60 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`} />
              Refresh
            </button>
          </div>
          <p className="relative text-white/80 text-sm sm:text-base mt-4 max-w-2xl">
            See how you stack up against other members based on posts, events, badges, and followers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 glass-card rounded-2xl shadow-lg">
          {CATEGORY_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setCategory(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  category === t.id
                    ? "btn-primary"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIOD_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
                period === t.id
                  ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25"
                  : "bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {(insight?.suggestion || insightLoading) && (
          <div className="glass-card rounded-3xl shadow-lg p-5 sm:p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
                AI Tip
              </p>
              {insightLoading ? (
                <p className="text-sm text-gray-400 animate-pulse">Thinking of a tip for you...</p>
              ) : (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{insight.suggestion}</p>
                  {insight.nextRankEntry && insight.pointsToNextRank != null && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {insight.pointsToNextRank} points behind #{insight.nextRankEntry.rank} ({insight.nextRankEntry.userName})
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {myEntry && (
          <div className="glass-card-hover rounded-3xl shadow-lg p-4 sm:p-5 flex items-center gap-4 border-2 border-red-500/20">
            <RankBadge rank={myEntry.rank} />
            <img
              src={
                myEntry.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(myEntry.userName || "U")}&background=dc2626&color=fff&bold=true`
              }
              alt={myEntry.userName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-red-400/40 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-800 dark:text-white truncate flex items-center gap-1.5">
                {myEntry.userName}
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">You</span>
              </p>
              {myEntry.department && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{myEntry.department}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg text-gray-800 dark:text-white">{myEntry.points}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">points</p>
            </div>
          </div>
        )}

        {topEntries.length === 0 && !myEntry && (
          <div className="glass-card rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                <Trophy className="w-12 h-12 text-red-500" />
              </div>
              <h3>No activity yet</h3>
              <p>Nobody has scored points in this category and period yet. Be the first!</p>
            </div>
          </div>
        )}

        {topEntries.length > 0 && (
          <div className="glass-card rounded-3xl shadow-xl shadow-red-500/10 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {topEntries.map((entry) => (
                <Link
                  key={entry.userId}
                  to={`/profile/${entry.userId}`}
                  className={`flex items-center gap-4 p-4 sm:p-5 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 ${
                    entry.isCurrentUser ? "bg-red-50/60 dark:bg-red-900/10" : ""
                  }`}
                >
                  <RankBadge rank={entry.rank} />
                  <img
                    src={
                      entry.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.userName || "U")}&background=dc2626&color=fff&bold=true`
                    }
                    alt={entry.userName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white truncate flex items-center gap-1.5">
                      {entry.userName}
                      {entry.isCurrentUser && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </p>
                    {entry.department && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{entry.department}</p>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{entry.postCount}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{entry.eventCount}</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" />{entry.badgeCount}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{entry.followerCount}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      {entry.points}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">points</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {myRankOutsideTop && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            You're ranked #{myEntry.rank}, outside the top {topEntries.length} shown above.
          </p>
        )}
      </div>
    </div>
  );
}