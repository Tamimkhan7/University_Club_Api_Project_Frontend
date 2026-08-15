import { useEffect, useRef, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { usePresence, formatLastSeen } from "../context/PresenceContext";
import Loader from "../components/Loader";
import Logo from "../components/Logo";
import toast from "react-hot-toast";
import {
  Search, Users as UsersIcon, Sparkles, UserPlus, UserMinus,
  ChevronRight, UserCheck, Star, TrendingUp, Award, 
  Crown, MessageCircle, Heart, Activity, Globe,
  Bell, Settings, MoreVertical, Filter, Building2,
  BookOpen, Target, Eye, ThumbsUp, Mail, MapPin
} from "lucide-react";


export default function Users() {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followBusy, setFollowBusy] = useState({});
  const location = useLocation();
  const debounceRef = useRef(null);
  const isFirstRun = useRef(true);

  // Live online/last-seen status for every user currently on screen, kept
  // up to date via the NotificationHub's WatchPresence/UserPresenceChanged
  // (see /api/presence + PresenceContext). Falls back to the isOnline
  // snapshot the /user/all|/user/search endpoint already returns until the
  // live value arrives.
  const presence = usePresence(users.map((u) => u.id));

  const loadUsers = async (targetPage = 1, query = "", isInitial = false) => {
    if (isInitial) setLoading(true);
    else setSearching(true);
    try {
      const endpoint = query ? "/user/search" : "/user/all";
      const res = await api.get(endpoint, { params: { query, page: targetPage, pageSize: 20 } });
      const data = res.data || {};
      setUsers(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(getErrorMessage(error, "Failed to load users"));
    } finally {
      if (isInitial) setLoading(false);
      else setSearching(false);
    }
  };

  // Sync searchQuery from the URL (e.g. navigated in from a "search users"
  // link elsewhere in the app). Does not call the API directly — the
  // debounced effect below reacts to searchQuery changes and loads results.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || "";
    setSearchQuery(urlSearch);
  }, [location]);

  // Real-time search: whenever searchQuery changes, wait briefly for the
  // user to stop typing, then fetch. The initial mount fires immediately
  // (no artificial delay) so the page loads without waiting.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isFirstRun.current) {
      isFirstRun.current = false;
      loadUsers(1, searchQuery.trim(), true);
      return;
    }

    debounceRef.current = setTimeout(() => {
      loadUsers(1, searchQuery.trim());
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    loadUsers(1, searchQuery.trim());
  };

  const toggleFollow = async (targetUser) => {
    setFollowBusy((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      if (targetUser.isFollowing) {
        await api.delete(`/user/follow/${targetUser.id}`);
      } else {
        await api.post(`/user/follow/${targetUser.id}`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isFollowing: !u.isFollowing } : u))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setFollowBusy((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const getRandomGradient = (id) => {
    const gradients = [
      "from-red-500 to-rose-500", "from-rose-500 to-red-600", "from-red-600 to-rose-500",
      "from-rose-600 to-red-500", "from-red-500 to-orange-500", "from-rose-500 to-pink-500",
      "from-red-600 to-rose-600", "from-rose-500 to-red-500",
    ];
    return gradients[id % gradients.length];
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-16">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 lg:space-y-8">
        
        {/* Hero Header */}
        <div className="page-hero p-8 lg:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="page-hero-icon">
                  <Logo size={32} className="rounded-lg" />
                </div>
                <div>
                  <span className="hero-pill mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Where Code Meets Community
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-2">Community</h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    Connect with fellow university students
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg border border-white/20">
                  <Activity className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-semibold">{users.length} Members</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-white/20">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card rounded-2xl shadow-xl shadow-red-500/10 p-5 lg:p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, department, or skills..."
                className="input-premium pl-12 pr-4 py-3.5"
              />
            </div>
            <button type="submit" className="btn-primary px-8 py-3.5 flex items-center justify-center gap-2">
              <Search className={`w-4 h-4 ${searching ? "animate-pulse" : ""}`} /> Search
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="glass-card rounded-xl px-4 py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Total: <strong className="text-red-600 dark:text-red-400">{users.length}</strong></span>
            </div>
            <div className="glass-card rounded-xl px-4 py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Page: <strong className="text-red-600 dark:text-red-400">{page} of {totalPages}</strong></span>
            </div>
          </div>
          <button className="flex items-center gap-2 glass-card rounded-xl px-4 py-2 hover:border-red-300 transition-colors">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Filter</span>
          </button>
        </div>

        {/* User Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7 transition-opacity duration-200 ${searching ? "opacity-60" : "opacity-100"}`}>
          {users.map((u, index) => {
            const gradient = getRandomGradient(u.id);
            const isMe = me && me.id === u.id;
            const live = presence[u.id];
            const isOnline = live ? live.isOnline : u.isOnline;
            const lastSeenLabel = !isOnline ? formatLastSeen(live?.lastSeenAt ?? u.lastSeenAt) : null;
            return (
              <div
                key={u.id}
                className="group relative glass-card rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-red-500/15 transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                <Link to={`/profile/${u.id}`} className="block">
                  <div className="relative">
                    <div className={`relative h-24 sm:h-28 bg-gradient-to-br ${gradient} overflow-hidden`}>
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
                          backgroundSize: "16px 16px",
                        }}
                      />
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                      {isOnline ? (
                        <div className="absolute top-3 left-3 bg-black/25 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1 text-[11px] text-white font-medium flex items-center gap-1.5 border border-white/10">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                          </span>
                          Online
                        </div>
                      ) : lastSeenLabel ? (
                        <div className="absolute top-3 left-3 bg-black/25 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1 text-[11px] text-white font-medium flex items-center gap-1.5 border border-white/10">
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gray-300/70" />
                          {lastSeenLabel}
                        </div>
                      ) : null}
                    </div>

                    <div className="absolute -bottom-11 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-amber-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                        <img
                          src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&size=120`}
                          alt={u.name}
                          className="relative w-[88px] h-[88px] sm:w-24 sm:h-24 rounded-full ring-4 ring-white dark:ring-ink-900 shadow-xl object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isOnline && (
                          <span className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-4 h-4 bg-green-500 rounded-full ring-[3px] ring-white dark:ring-ink-900" />
                        )}
                        {isMe && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30 ring-2 ring-white dark:ring-ink-900">
                            <Crown className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-14 sm:pt-16 pb-3 px-5 text-center">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                      {u.name}
                    </h3>
                    {u.userName && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">@{u.userName}</p>
                    )}
                    {(u.department || u.batch) && (
                      <div className="mt-2.5 flex items-center justify-center flex-wrap gap-1.5">
                        {u.department && (
                          <span className="badge-premium !py-1">
                            <Building2 className="w-3 h-3" />
                            {u.department}
                          </span>
                        )}
                        {u.batch && (
                          <span className="badge-premium !py-1 !from-amber-500/10 !to-orange-500/10 !text-amber-600 dark:!text-amber-400 !border-amber-200/50 dark:!border-amber-800/30">
                            <BookOpen className="w-3 h-3" />
                            Batch {u.batch}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        {Math.floor(Math.random() * 100) + 50}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                        {Math.floor(Math.random() * 50) + 10}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="px-5 pb-5 pt-1 space-y-2.5">
                  {!isMe ? (
                    <button
                      onClick={() => toggleFollow(u)}
                      disabled={followBusy[u.id]}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        u.isFollowing
                          ? "bg-gray-100 dark:bg-ink-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          : "btn-primary !py-2.5"
                      }`}
                    >
                      {u.isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl text-center text-sm font-semibold text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30">
                      <span className="flex items-center justify-center gap-2">
                        <Crown className="w-4 h-4" />
                        This is you
                      </span>
                    </div>
                  )}
                  <Link to={`/profile/${u.id}`} className="group/link flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    View Profile
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                <UsersIcon className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No members found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button 
              disabled={page <= 1} 
              onClick={() => loadUsers(page - 1, searchQuery)} 
              className="px-6 py-2.5 rounded-xl glass-card border border-gray-200/50 dark:border-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 transition-colors font-medium text-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => loadUsers(pageNum, searchQuery)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                      pageNum === page
                        ? "btn-primary w-10 h-10 flex items-center justify-center"
                        : "bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-gray-400">...</span>}
            </div>
            <button 
              disabled={page >= totalPages} 
              onClick={() => loadUsers(page + 1, searchQuery)} 
              className="px-6 py-2.5 rounded-xl glass-card border border-gray-200/50 dark:border-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 transition-colors font-medium text-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="bg-gradient-to-r from-gray-100/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 mt-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Total Members</p>
                <p className="font-bold text-gray-800 dark:text-white">{users.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Community</p>
                <p className="font-bold text-gray-800 dark:text-white">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Growth</p>
                <p className="font-bold text-gray-800 dark:text-white">Daily</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Campus</p>
                <p className="font-bold text-gray-800 dark:text-white">University</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}