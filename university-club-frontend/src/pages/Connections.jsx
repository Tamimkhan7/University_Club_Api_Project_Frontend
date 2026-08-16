import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage, toArray } from "../api/axios";
import { presenceApi } from "../api/presence";
import { usePresence, formatLastSeen } from "../context/PresenceContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  UserPlus, UserMinus, UserX, Users, Search, Sparkles, ShieldOff, Ban,
  User, Heart, Star, Award, Crown, Zap, Clock, CheckCircle,
  XCircle, ChevronRight, ChevronDown, Filter, Grid3x3,
  MessageCircle, Share2, Link2, Globe, Compass, Activity,
  Building2, BookOpen, Target, Eye, ThumbsUp
} from "lucide-react";

const TABS = [
  { id: "suggestions", label: "Suggestions", icon: Sparkles },
  { id: "common", label: "Common Interests", icon: Star },
  { id: "followers", label: "My Followers", icon: Users },
  { id: "following", label: "My Following", icon: UserPlus },
  { id: "online", label: "Online Now", icon: Activity },
  { id: "blocked", label: "Blocked Users", icon: Ban },
];

const avatarFor = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=dc2626&color=fff&bold=true`;

export default function Connections() {
  const [tab, setTab] = useState("suggestions");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const isFirstRun = useRef(true);
  const skipNextSearchEffect = useRef(false);
  const searchDebounceRef = useRef(null);

 
  const presence = usePresence(list.map((u) => u.id));

  const load = async (targetPage = 1, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setSearching(true);
    try {
      const query = searchTerm.trim().toLowerCase();
      setIsSearchMode(!!query);
      let res;
      const matches = (u) => u.name?.toLowerCase().includes(query);

    
      const fetchAllItems = async (endpoint) => {
        const first = await api.get(endpoint, { params: { page: 1, pageSize: 20 } });
        let items = first.data?.items || [];
        const totalPages = first.data?.totalPages || 1;
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              api.get(endpoint, { params: { page: i + 2, pageSize: 20 } })
            )
          );
          rest.forEach((r) => { items = items.concat(r.data?.items || []); });
        }
        return items;
      };

      switch (tab) {
        case "suggestions": {
          res = await api.get("/follow/suggestions");
        
          const data = toArray(res.data);
          setList(query ? data.filter(matches) : data);
          setTotalPages(1);
          break;
        }
        case "common": {
          res = await api.get("/follow/suggestions/common");
          const data = toArray(res.data);
          setList(query ? data.filter(matches) : data);
          setTotalPages(1);
          break;
        }
        case "followers": {
          if (query) {
            const items = await fetchAllItems("/follow/followers");
            setList(items.filter(matches));
            setTotalPages(1);
          } else {
            res = await api.get("/follow/followers", { params: { page: targetPage, pageSize: 20 } });
            setList(res.data?.items || []);
            setTotalPages(res.data?.totalPages || 1);
          }
          break;
        }
        case "following": {
          if (query) {
            const items = await fetchAllItems("/follow/following");
            setList(items.filter(matches));
            setTotalPages(1);
          } else {
            res = await api.get("/follow/following", { params: { page: targetPage, pageSize: 20 } });
            setList(res.data?.items || []);
            setTotalPages(res.data?.totalPages || 1);
          }
          break;
        }
        case "online": {
       
          const pageSize = 20;
          const toCard = (p) => ({
            id: p.userId,
            name: p.userName,
            profileImage: p.profileImage,
            isOnline: p.isOnline,
            lastSeenAt: p.lastSeenAt,
            isFollowing: true,
          });

          if (query) {
          
            let items = [];
            for (let p = 1; p <= 10; p++) {
              const batch = await presenceApi.getOnlineFollowing(p, pageSize);
              items = items.concat((batch || []).map(toCard));
              if (!batch || batch.length < pageSize) break;
            }
            setList(items.filter(matches));
            setTotalPages(1);
          } else {
            const items = await presenceApi.getOnlineFollowing(targetPage, pageSize);
            setList((items || []).map(toCard));
      
            setTotalPages((items || []).length < pageSize ? targetPage : targetPage + 1);
          }
          break;
        }
        case "blocked": {
          if (query) {
            const items = await fetchAllItems("/follow/blocked");
            setList(items.filter(matches));
            setTotalPages(1);
          } else {
            res = await api.get("/follow/blocked", { params: { page: targetPage, pageSize: 20 } });
            setList(res.data?.items || []);
            setTotalPages(res.data?.totalPages || 1);
          }
          break;
        }
        default:
          break;
      }
      setPage(query ? 1 : targetPage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load"));
    } finally {
      if (isInitial) setLoading(false);
      else setSearching(false);
    }
  };

 
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      load(1, true);
    } else {
      load(1);
    }
  }, [tab]);


  useEffect(() => {
    if (isFirstRun.current) return;
    if (skipNextSearchEffect.current) {
      skipNextSearchEffect.current = false;
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      load(1);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);

  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    load(1);
  };

  const clearSearch = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    skipNextSearchEffect.current = true;
    setSearchTerm("");
    load(1);
  };

  const selectTab = (id) => {
  
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    skipNextSearchEffect.current = true;
    setSearchTerm("");
    setIsSearchMode(false);
    setTab(id);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        <div className="relative mb-8">
          <div className="page-hero p-6 sm:p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10">
                  <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <span className="hero-pill mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Grow Your Network
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-2">Connections</h1>
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

        <form onSubmit={handleSearch} className="mb-6 w-full relative group">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300 ${searching ? "animate-pulse" : ""}`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people..."
              className="input-premium w-full pl-12 pr-4 py-3.5"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-6 p-1.5 glass-card rounded-2xl shadow-lg">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  tab === t.id 
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

        {list.length === 0 ? (
          <div className="glass-card rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                {isSearchMode ? (
                  <Search className="w-12 h-12 text-red-500" />
                ) : (
                  <>
                    {tab === "suggestions" && <Sparkles className="w-12 h-12 text-red-500" />}
                    {tab === "common" && <Star className="w-12 h-12 text-red-500" />}
                    {tab === "followers" && <Users className="w-12 h-12 text-red-500" />}
                    {tab === "following" && <UserPlus className="w-12 h-12 text-red-500" />}
                    {tab === "online" && <Activity className="w-12 h-12 text-red-500" />}
                    {tab === "blocked" && <Ban className="w-12 h-12 text-red-500" />}
                  </>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                {isSearchMode ? (
                  "No results found"
                ) : (
                  <>
                    {tab === "suggestions" && "No suggestions"}
                    {tab === "common" && "No common interests"}
                    {tab === "followers" && "No followers yet"}
                    {tab === "following" && "Not following anyone"}
                    {tab === "online" && "No one you follow is online"}
                    {tab === "blocked" && "No blocked users"}
                  </>
                )}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {isSearchMode ? "Try a different search term" : "Connect with others to build your network"}
              </p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${searching ? "opacity-60" : "opacity-100"}`}>
            {list.map((u) => {
              const live = presence[u.id];
              const isOnline = live ? live.isOnline : u.isOnline;
              const lastSeenLabel = !isOnline ? formatLastSeen(live?.lastSeenAt ?? u.lastSeenAt) : null;
              return (
              <div
                key={u.id}
                className="group relative glass-card-hover rounded-3xl p-6 flex flex-col items-center text-center animate-fadeIn overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-red-500/5 to-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <img
                    src={u.profileImage || avatarFor(u.name)}
                    alt={u.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = avatarFor(u.name);
                    }}
                    className="relative w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  {isOnline ? (
                    <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full ring-[3px] ring-white dark:ring-slate-900" />
                  ) : (
                    <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ring-[3px] ring-white dark:ring-slate-900" />
                  )}
                </div>

                <Link
                  to={`/profile/${u.id}`}
                  className="relative mt-4 font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 truncate max-w-full"
                >
                  {u.name}
                </Link>

                <div className="relative flex flex-wrap justify-center items-center gap-2 mt-2 text-xs">
                  {isOnline && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </span>
                      Online
                    </span>
                  )}
                  {!isOnline && lastSeenLabel && (
                    <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                      <Activity className="w-3 h-3" />
                      Active {lastSeenLabel}
                    </span>
                  )}
                  {u.mutualCount !== undefined && u.mutualCount > 0 && (
                    <span className="badge-premium !py-1">
                      <Heart className="w-3 h-3" />
                      {u.mutualCount} mutual
                    </span>
                  )}
                  {u.followedAt && (
                    <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
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

                <div className="relative flex gap-2 mt-5 w-full">
                  {tab === "blocked" ? (
                    <button
                      onClick={() => unblock(u.id)}
                      disabled={busyId === u.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 text-sm font-medium"
                    >
                      <ShieldOff className="w-4 h-4" /> Unblock
                    </button>
                  ) : tab === "following" || u.isFollowing ? (
                    <button
                      onClick={() => unfollow(u.id)}
                      disabled={busyId === u.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 text-sm font-medium"
                    >
                      <UserMinus className="w-4 h-4" /> Unfollow
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => follow(u.id)}
                        disabled={busyId === u.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 text-sm font-medium"
                      >
                        <UserPlus className="w-4 h-4" /> Follow
                      </button>
                      <button
                        onClick={() => block(u.id)}
                        disabled={busyId === u.id}
                        className="p-2.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                        title="Block"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}

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
                        ? "btn-primary w-10 h-10 flex items-center justify-center"
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
    </div>
  );
}