import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  UserPlus, UserMinus, UserX, Users, Search, Sparkles, ShieldOff, Ban,
  User, Heart, Star, Award, Crown, Zap, Clock, CheckCircle,
  XCircle, ChevronRight, ChevronDown, Filter, Grid3x3,
  MessageCircle, Share2, Link2, Globe, Compass
} from "lucide-react";

const TABS = [
  { id: "suggestions", label: "Suggestions", icon: Sparkles },
  { id: "common", label: "Common Interests", icon: Star },
  { id: "followers", label: "My Followers", icon: Users },
  { id: "following", label: "My Following", icon: UserPlus },
  { id: "blocked", label: "Blocked Users", icon: Ban },
  { id: "search", label: "Search", icon: Search },
];

/**
 * ============================================================
 *  🔗 Connections — Premium Connections Management
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Manage followers, following, and blocks     │
 *  │  🔥 Features: Suggestions, Search, Follow/Unfollow       │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 */

export default function Connections() {
  const [tab, setTab] = useState("suggestions");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async (targetPage = 1) => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case "suggestions":
          res = await api.get("/follow/suggestions");
          setList(res.data || []);
          setTotalPages(1);
          break;
        case "common":
          res = await api.get("/follow/suggestions/common");
          setList(res.data || []);
          setTotalPages(1);
          break;
        case "followers":
          res = await api.get("/follow/followers", { params: { page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        case "following":
          res = await api.get("/follow/following", { params: { page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        case "blocked":
          res = await api.get("/follow/blocked", { params: { page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        case "search":
          if (!searchTerm.trim()) {
            setList([]);
            setTotalPages(1);
            break;
          }
          res = await api.get("/follow/search", { params: { query: searchTerm.trim(), page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        default:
          break;
      }
      setPage(targetPage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const follow = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/follow/${id}`);
      toast.success("Followed!");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to follow"));
    } finally {
      setBusyId(null);
    }
  };

  const unfollow = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/follow/${id}`);
      toast.success("Unfollowed");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to unfollow"));
    } finally {
      setBusyId(null);
    }
  };

  const block = async (id) => {
    if (!confirm("Block this user?")) return;
    setBusyId(id);
    try {
      await api.post(`/follow/block/${id}`);
      toast.success("User blocked");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to block"));
    } finally {
      setBusyId(null);
    }
  };

  const unblock = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/follow/unblock/${id}`);
      toast.success("User unblocked");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to unblock"));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 pb-12 overflow-hidden">
      
      {/* Premium Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Connections</h1>
                  <p className="text-white/80 text-sm mt-1">Discover and connect with amazing people</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{list.length} Connections</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  tab === t.id 
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-105" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        {tab === "search" && (
          <form onSubmit={handleSearch} className="mb-6 relative group">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search people..."
                className="w-full px-5 py-3.5 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-300 outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(""); load(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Empty State */}
        {list.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {tab === "suggestions" && <Sparkles className="w-12 h-12 text-red-500" />}
              {tab === "common" && <Star className="w-12 h-12 text-red-500" />}
              {tab === "followers" && <Users className="w-12 h-12 text-red-500" />}
              {tab === "following" && <UserPlus className="w-12 h-12 text-red-500" />}
              {tab === "blocked" && <Ban className="w-12 h-12 text-red-500" />}
              {tab === "search" && <Search className="w-12 h-12 text-red-500" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {tab === "suggestions" && "No suggestions"}
              {tab === "common" && "No common interests"}
              {tab === "followers" && "No followers yet"}
              {tab === "following" && "Not following anyone"}
              {tab === "blocked" && "No blocked users"}
              {tab === "search" && searchTerm ? "No results found" : "Search for people"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {tab === "search" && searchTerm ? "Try a different search term" : "Connect with others to build your network"}
            </p>
          </div>
        ) : (
          /* User Grid */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {list.map((u) => (
              <div
                key={u.id}
                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-red-200/50 dark:hover:border-red-800/30 hover:-translate-y-1 p-4 flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                  <img
                    src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=dc2626&color=fff&bold=true`}
                    alt={u.name}
                    className="relative w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${u.id}`}
                    className="font-semibold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 truncate block"
                  >
                    {u.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {u.mutualCount !== undefined && u.mutualCount > 0 && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Heart className="w-3 h-3 text-red-400" />
                        {u.mutualCount} mutual
                      </span>
                    )}
                    {u.followedAt && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(u.followedAt).toLocaleDateString()}
                      </span>
                    )}
                    {u.blockedAt && (
                      <span className="flex items-center gap-1 text-red-400">
                        <Ban className="w-3 h-3" />
                        Blocked {new Date(u.blockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {tab === "blocked" ? (
                    <button
                      onClick={() => unblock(u.id)}
                      disabled={busyId === u.id}
                      className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                      title="Unblock"
                    >
                      <ShieldOff className="w-4 h-4" />
                    </button>
                  ) : tab === "following" ? (
                    <button
                      onClick={() => unfollow(u.id)}
                      disabled={busyId === u.id}
                      className="p-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                      title="Unfollow"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => follow(u.id)}
                        disabled={busyId === u.id}
                        className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                        title="Follow"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => block(u.id)}
                        disabled={busyId === u.id}
                        className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                        title="Block"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) return null;
                }
                return (
                  <button
                    key={i}
                    onClick={() => load(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              Next
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}