import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import toast from "react-hot-toast";
import {
  Sparkles, Users, MessageCircle, Heart, TrendingUp, AlertCircle,
  Rocket, UserCircle, ChevronRight, Gem, Lightbulb,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.name || "User");

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setError(null);
    setLoading(true);
    try {
      const [statsRes, trendingRes, insightRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/trending"),
        api.get("/dashboard/ai-insight"),
      ]);

      const statsData = statsRes.data || {};
      setStats({
        totalPosts: statsData.totalPosts || 0,
        totalClubs: statsData.totalClubs || 0,
        totalComments: statsData.totalComments || 0,
        totalReactions: statsData.totalReactions || 0,
        myPosts: statsData.myPosts || 0,
        myClubs: statsData.myClubs || 0,
        recentActivity: {
          newUsers: statsData.recentActivity?.newUsers || 0,
          newPosts: statsData.recentActivity?.newPosts || 0,
        },
      });
      setTrendingPosts(trendingRes.data || []);
      setInsight(insightRes.data?.insight || "");
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError(getErrorMessage(error, "Failed to load dashboard"));
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto animate-pulse shadow-xl shadow-red-500/25 bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <div className="relative w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadDashboard}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold flex items-center gap-2 mx-auto"
        >
          <Rocket className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    { title: "Total Posts", value: stats?.totalPosts || 0, icon: MessageCircle, iconBg: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { title: "Total Clubs", value: stats?.totalClubs || 0, icon: Users, iconBg: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { title: "Comments", value: stats?.totalComments || 0, icon: MessageCircle, iconBg: "bg-gradient-to-r from-green-500 to-emerald-500" },
    { title: "Reactions", value: stats?.totalReactions || 0, icon: Heart, iconBg: "bg-gradient-to-r from-red-500 to-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-white/80 text-xs sm:text-sm block">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">{greeting}, {userName}! 👋</h1>
              </div>
            </div>
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mt-4">
              Welcome back! Here's what's happening in your community today.
            </p>
          </div>
        </div>

        {insight && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 sm:p-5 text-white shadow-lg flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">Your Insight</h4>
              <p className="text-white/90 text-xs sm:text-sm mt-1">{insight}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1 p-4 sm:p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">{card.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{card.value.toLocaleString()}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Your Activity
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Posts Created</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-lg">{stats?.myPosts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Clubs Joined</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">{stats?.myClubs || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> This Week
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">New Members</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">+{stats?.recentActivity?.newUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">New Posts</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">+{stats?.recentActivity?.newPosts || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-red-600 px-5 sm:px-6 py-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> Trending Posts
            </h3>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {trendingPosts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No trending posts yet</p>
              </div>
            ) : (
              trendingPosts.map((post, idx) => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><UserCircle className="w-3 h-3" /> {post.userName}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {post.reactionCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-500" /> {post.commentCount}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link to="/clubs" className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Browse Clubs</p>
            </Link>
            <Link to="/" className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Create Post</p>
            </Link>
            <Link to="/users" className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Find Friends</p>
            </Link>
            <Link to="/profile" className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Edit Profile</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
