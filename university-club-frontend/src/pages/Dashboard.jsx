import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import BackgroundDecoration from "../components/BackgroundDecoration";
import toast from "react-hot-toast";
import {
  Sparkles, Users, MessageCircle, Heart, TrendingUp, AlertCircle,
  Rocket, UserCircle, ChevronRight, Gem, Lightbulb,
  Activity, BarChart3, Clock, Zap, Flame, Award,
  Calendar, Compass, Coffee, Star, Crown, Shield,
  Eye, BookOpen, Target, Trophy, Gift, PartyPopper
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl mx-auto shadow-2xl shadow-red-500/25 bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center animate-float">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-6 font-medium animate-pulse">
            Loading your dashboard...
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce-dot" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce-dot" style={{ animationDelay: "0.15s" }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce-dot" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <div className="relative w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-800/30 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadDashboard}
          className="btn-primary group"
        >
          <Rocket className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Posts", 
      value: stats?.totalPosts || 0, 
      icon: MessageCircle, 
      iconBg: "from-blue-500 to-cyan-500",
      gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      border: "hover:border-blue-300 dark:hover:border-blue-700"
    },
    { 
      title: "Total Clubs", 
      value: stats?.totalClubs || 0, 
      icon: Users, 
      iconBg: "from-purple-500 to-pink-500",
      gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      border: "hover:border-purple-300 dark:hover:border-purple-700"
    },
    { 
      title: "Comments", 
      value: stats?.totalComments || 0, 
      icon: MessageCircle, 
      iconBg: "from-green-500 to-emerald-500",
      gradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      border: "hover:border-green-300 dark:hover:border-green-700"
    },
    { 
      title: "Reactions", 
      value: stats?.totalReactions || 0, 
      icon: Heart, 
      iconBg: "from-red-500 to-rose-500",
      gradient: "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
      border: "hover:border-red-300 dark:hover:border-red-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-10">
      
      <BackgroundDecoration />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        <div className="page-hero p-6 sm:p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10">
                <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/70 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
                  {greeting}, {userName}! 
                  <span className="text-2xl sm:text-3xl md:text-4xl">👋</span>
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <Shield className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">Pro Member</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <Crown className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">{stats?.myClubs || 0} Clubs</span>
              </div>
            </div>
          </div>
          <p className="relative text-white/80 text-sm sm:text-base mt-4 max-w-2xl">
            Welcome back! Here's what's happening in your community today.
          </p>
        </div>

        {insight && (
          <div className="group bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-amber-500/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-amber-200/50 dark:border-amber-800/30 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm sm:text-base">✨ AI Insight</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">{insight}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`glass-card rounded-2xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 border ${card.border} p-5 animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
                      {card.title}
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span>Active</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Your Activity */}
          <div className="glass-card rounded-2xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <h3 className="relative font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                Your Activity
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Posts Created
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {stats?.myPosts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Clubs Joined
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {stats?.myClubs || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <h3 className="relative font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                This Week
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  New Members
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-1">
                  +{stats?.recentActivity?.newUsers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  New Posts
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-1">
                  +{stats?.recentActivity?.newPosts || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-red-600 px-5 sm:px-6 py-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            <h3 className="relative font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              Trending Posts
            </h3>
          </div>
          <div className="p-4 sm:p-5 divide-y divide-gray-100 dark:divide-gray-700">
            {trendingPosts.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No trending posts yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for hot content</p>
              </div>
            ) : (
              trendingPosts.map((post, idx) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-300 group"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0 ${
                    idx === 0 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                    idx === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                    "bg-gradient-to-r from-amber-600 to-amber-700"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <UserCircle className="w-3.5 h-3.5" />
                        {post.userName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        {post.reactionCount}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/clubs"
              className="group text-center p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-red-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Browse Clubs
              </p>
            </Link>
            <Link
              to="/"
              className="group text-center p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-red-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Create Post
              </p>
            </Link>
            <Link
              to="/users"
              className="group text-center p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-green-500/25">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Find Friends
              </p>
            </Link>
            <Link
              to="/profile"
              className="group text-center p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-amber-500/25">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Edit Profile
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}