import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  Users,
  MessageCircle,
  Heart,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  Target,
  Zap,
  UserCircle,
  AlertCircle,
  Award,
  Flame,
  Rocket,
  ChevronRight,
  BarChart3,
  ThumbsUp,
  Eye,
  Share2,
  CheckCircle,
  Gift,
  Star,
  Crown,
  Gem,
  Coffee,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.name || "User");

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setError(null);
    try {
      console.log("Fetching dashboard data...");
      const [statsRes, trendingRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/trending"),
      ]);

      // Add fallback for missing data
      const statsData = statsRes.data || {};

      // Provide default values for missing fields
      const safeStats = {
        totalPosts: statsData.totalPosts || 0,
        totalClubs: statsData.totalClubs || 0,
        totalComments: statsData.totalComments || 0,
        totalReactions: statsData.totalReactions || 0,
        myPosts: statsData.myPosts || 0,
        myClubs: statsData.myClubs || 0,
        streak: statsData.streak || 0,
        totalViews: statsData.totalViews || 0,
        totalShares: statsData.totalShares || 0,
        myComments: statsData.myComments || 0,
        myReactions: statsData.myReactions || 0,
        totalReach: statsData.totalReach || 0,
        engagementRate: statsData.engagementRate || 0,
        influenceScore: statsData.influenceScore || 0,
        recentActivity: {
          newUsers: statsData.recentActivity?.newUsers || 0,
          newPosts: statsData.recentActivity?.newPosts || 0,
          newReactions: statsData.recentActivity?.newReactions || 0,
        },
      };

      setStats(safeStats);
      setTrendingPosts(trendingRes.data || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load dashboard",
      );
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto animate-pulse shadow-xl shadow-red-500/25 bg-white p-2">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVifde8HHEEoz6yz-nSHMKMMRNOeHfCE-GoA&s"
                alt="PUCPC Logo"
                className="w-full h-full object-contain animate-spin-slow"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">
            Loading your dashboard...
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Getting the latest updates
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <button
          onClick={loadDashboard}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold flex items-center gap-2 mx-auto"
        >
          <Rocket className="w-4 h-4" />
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
      gradient: "from-blue-500 to-cyan-500",
      bgGradient:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      iconBg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Clubs",
      value: stats?.totalClubs || 0,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient:
        "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      iconBg: "bg-gradient-to-r from-purple-500 to-pink-500",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Comments",
      value: stats?.totalComments || 0,
      icon: MessageCircle,
      gradient: "from-green-500 to-emerald-500",
      bgGradient:
        "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      iconBg: "bg-gradient-to-r from-green-500 to-emerald-500",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Reactions",
      value: stats?.totalReactions || 0,
      icon: Heart,
      gradient: "from-red-500 to-rose-500",
      bgGradient:
        "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      iconBg: "bg-gradient-to-r from-red-500 to-rose-500",
      trend: "+15%",
      trendUp: true,
    },
  ];

  const achievements = [
    {
      icon: Award,
      title: "Post Master",
      condition: stats?.myPosts >= 10,
      progress: Math.min(100, (stats?.myPosts / 10) * 100),
    },
    {
      icon: Users,
      title: "Social Butterfly",
      condition: stats?.myClubs >= 5,
      progress: Math.min(100, (stats?.myClubs / 5) * 100),
    },
    {
      icon: Heart,
      title: "Popular",
      condition: (stats?.myReactions || 0) >= 50,
      progress: Math.min(100, ((stats?.myReactions || 0) / 50) * 100),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Welcome Hero Section - Red Theme */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-20 left-20 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-white/80 text-xs sm:text-sm block">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">
                    {greeting}, {userName}! 👋
                  </h1>
                </div>
              </div>

              {/* Streak Badge */}
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 shadow-lg">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                <span className="text-sm sm:text-base font-semibold">
                  {stats?.streak || 0} Day Streak
                </span>
              </div>
            </div>

            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mt-2">
              Welcome back! Here's what's happening in your community today.
              <span className="block text-white/70 text-xs sm:text-sm mt-1">
                {trendingPosts.length} trending posts • {stats?.totalPosts}{" "}
                total posts
              </span>
            </p>

            {/* Quick Stats Row */}
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{stats?.totalViews || 0} Views</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{stats?.totalShares || 0} Shares</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{stats?.engagementRate || 0}% Engagement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`group bg-gradient-to-br ${card.bgGradient} bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1 p-4 sm:p-5 border border-gray-100 dark:border-gray-700 animate-slideUp`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                      {card.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className={`text-xs font-medium ${card.trendUp ? "text-green-500" : "text-red-500"}`}
                      >
                        {card.trend}
                      </span>
                      <span className="text-xs text-gray-400">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Personal Stats & Achievements Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Your Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Your Activity
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Posts Created
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                    {stats?.myPosts || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((stats?.myPosts || 0) / 50) * 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Comments Written
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {stats?.myComments || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((stats?.myComments || 0) / 100) * 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Reactions Given
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                    {stats?.myReactions || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((stats?.myReactions || 0) / 200) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Impact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                Community Impact
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Clubs Joined
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                  {stats?.myClubs || 0}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Total Reach
                </span>
                <span className="font-bold text-pink-600 dark:text-pink-400 text-lg">
                  {stats?.totalReach || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Engagement Rate
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                  {stats?.engagementRate || 0}%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Influence Score</span>
                  <span className="font-bold text-lg text-red-600">
                    {stats?.influenceScore || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, stats?.influenceScore || 0)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                Achievements
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="space-y-4">
                {achievements.map((achievement, idx) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={idx} className="relative">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${achievement.condition ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        >
                          <Icon
                            className={`w-5 h-5 ${achievement.condition ? "text-white" : "text-gray-400"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {achievement.title}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${achievement.condition ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gray-400"}`}
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        {achievement.condition && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/achievements"
                className="block text-center mt-4 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                View all achievements →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity & Trending Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 sm:px-6 py-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                Recent Activity
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      New Members
                    </p>
                    <p className="text-xs text-gray-500">Joined this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    +{stats?.recentActivity?.newUsers || 0}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      New Posts
                    </p>
                    <p className="text-xs text-gray-500">Created this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    +{stats?.recentActivity?.newPosts || 0}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-md">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      New Reactions
                    </p>
                    <p className="text-xs text-gray-500">Given this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    +{stats?.recentActivity?.newReactions || 0}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Trending Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 px-5 sm:px-6 py-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Trending Posts
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {trendingPosts.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No trending posts yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Be the first to create engaging content!
                  </p>
                </div>
              ) : (
                trendingPosts.map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          {post.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          {post.reactionCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-blue-500" />
                          {post.commentCount || 0}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition flex-shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/clubs"
              className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Browse Clubs
              </p>
            </Link>

            <Link
              to="/"
              className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Post
              </p>
            </Link>

            <Link
              to="/users"
              className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Find Friends
              </p>
            </Link>

            <Link
              to="/profile"
              className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Edit Profile
              </p>
            </Link>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-xl p-4 sm:p-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">💡 Daily Tip</h4>
              <p className="text-white/90 text-xs sm:text-sm mt-1">
                Posts with images get 2x more engagement. Try adding visuals to
                your next post!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e53e3e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c53030;
        }
      `}</style>
    </div>
  );
}
