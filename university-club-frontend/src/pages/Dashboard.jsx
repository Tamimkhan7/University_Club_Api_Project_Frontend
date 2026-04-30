import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { 
  Sparkles, Users, MessageCircle, Heart, TrendingUp, 
  Activity, Calendar, Clock, ArrowRight, Target, Zap, 
  UserCircle, AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setError(null);
    try {
      console.log("Fetching dashboard data...");
      const [statsRes, trendingRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/trending")
      ]);
      console.log("Stats response:", statsRes.data);
      console.log("Trending response:", trendingRes.data);
      setStats(statsRes.data);
      setTrendingPosts(trendingRes.data || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || error.message || "Failed to load dashboard");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h3>
        <p className="text-slate-500 mb-4">{error}</p>
        <button 
          onClick={loadDashboard}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    { title: "Total Posts", value: stats?.totalPosts || 0, icon: MessageCircle, color: "from-blue-500 to-cyan-500" },
    { title: "Total Clubs", value: stats?.totalClubs || 0, icon: Users, color: "from-purple-500 to-pink-500" },
    { title: "Comments", value: stats?.totalComments || 0, icon: MessageCircle, color: "from-green-500 to-emerald-500" },
    { title: "Reactions", value: stats?.totalReactions || 0, icon: Heart, color: "from-red-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-white/80 text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">{greeting} 👋</h1>
          <p className="text-white/80 text-lg">Welcome back! Here's what's happening.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-800">{card.value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Your Posts</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.myPosts || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Clubs Joined</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.myClubs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">New Users (7 days)</p>
                  <p className="text-lg font-bold text-blue-600">+{stats?.recentActivity?.newUsers || 0}</p>
                </div>
              </div>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">New Posts (7 days)</p>
                  <p className="text-lg font-bold text-purple-600">+{stats?.recentActivity?.newPosts || 0}</p>
                </div>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Posts
            </h3>
          </div>
          <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
            {trendingPosts.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No trending posts yet</p>
              </div>
            ) : (
              trendingPosts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition group">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>By {post.userName}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {post.reactionCount}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/clubs" className="text-center p-3 rounded-xl bg-white hover:shadow-md transition group">
            <Users className="w-6 h-6 mx-auto mb-1 text-blue-500 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600">Browse Clubs</p>
          </Link>
          <Link to="/" className="text-center p-3 rounded-xl bg-white hover:shadow-md transition group">
            <Sparkles className="w-6 h-6 mx-auto mb-1 text-purple-500 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600">Create Post</p>
          </Link>
          <Link to="/users" className="text-center p-3 rounded-xl bg-white hover:shadow-md transition group">
            <UserCircle className="w-6 h-6 mx-auto mb-1 text-green-500 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600">Find Friends</p>
          </Link>
          <Link to="/profile" className="text-center p-3 rounded-xl bg-white hover:shadow-md transition group">
            <Heart className="w-6 h-6 mx-auto mb-1 text-red-500 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600">Edit Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}