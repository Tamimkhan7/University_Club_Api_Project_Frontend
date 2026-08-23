import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import searchApi, { SearchEntityType, SearchSortBy } from "../api/search";
import Pagination from "../components/Pagination";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import { formatBytes } from "../utils/formatBytes";
import toast from "react-hot-toast";
import {
  Search as SearchIcon, X, Users as UsersIcon, Building2, FileText, Calendar,
  UsersRound, FolderOpen, Sparkles, TrendingUp, Clock, ChevronRight,
  Heart, FileImage, FileVideo, FileAudio, File as FileIcon,
  Archive, CalendarClock, SlidersHorizontal, Trash2, Compass,
} from "lucide-react";

const TABS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: SearchEntityType.Users, label: "Users", icon: UsersIcon },
  { id: SearchEntityType.Clubs, label: "Clubs", icon: Building2 },
  { id: SearchEntityType.Posts, label: "Posts", icon: FileText },
  { id: SearchEntityType.Events, label: "Events", icon: Calendar },
  { id: SearchEntityType.Groups, label: "Groups", icon: UsersRound },
  { id: SearchEntityType.Files, label: "Files", icon: FolderOpen },
];

const SORT_OPTIONS = [
  { value: SearchSortBy.Relevance, label: "Relevance" },
  { value: SearchSortBy.Newest, label: "Newest" },
  { value: SearchSortBy.Oldest, label: "Oldest" },
  { value: SearchSortBy.Popular, label: "Most Popular" },
];

const fileIconFor = (fileType) => {
  const t = (fileType || "").toLowerCase();
  if (t.includes("image")) return FileImage;
  if (t.includes("video")) return FileVideo;
  if (t.includes("audio")) return FileAudio;
  if (t.includes("zip") || t.includes("rar") || t.includes("archive")) return Archive;
  return FileIcon;
};

// formatBytes এখন src/utils/formatBytes.js থেকে আসছে

const avatarFor = (name, img) =>
  img || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=e11d48&color=fff&bold=true&length=2`;

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const suggestTimer = useRef(null);

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [globalResult, setGlobalResult] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  const [advResult, setAdvResult] = useState(null);
  const [advLoading, setAdvLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState(SearchSortBy.Relevance);
  const [clubId, setClubId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clubsList, setClubsList] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [clearingRecent, setClearingRecent] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const supportsClubDateFilters = [SearchEntityType.Posts, SearchEntityType.Events, SearchEntityType.Files].includes(
    activeTab
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    setQuery(q);
    setSubmittedQuery(q);
    setActiveTab("all");
    setPage(1);
  }, [location.search]);

  const loadRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const data = await searchApi.getRecent(10);
      setRecent(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const data = await searchApi.getTrending(7, 10);
      setTrending(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecent();
    loadTrending();
  }, [loadRecent, loadTrending]);

  useEffect(() => {
    if (activeTab !== "all") return;
    if (!submittedQuery.trim()) {
      setGlobalResult(null);
      return;
    }
    let cancelled = false;
    setGlobalLoading(true);
    searchApi
      .globalSearch(submittedQuery.trim(), 6)
      .then((data) => {
        if (!cancelled) setGlobalResult(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error(getErrorMessage(error, "Search failed."));
      })
      .finally(() => {
        if (!cancelled) setGlobalLoading(false);
        loadRecent();
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, submittedQuery, loadRecent]);

  useEffect(() => {
    if (activeTab === "all") return;
    let cancelled = false;
    setAdvLoading(true);
    searchApi
      .advancedSearch({
        type: activeTab,
        query: submittedQuery.trim(),
        clubId: clubId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy,
        page,
        pageSize: 12,
      })
      .then((data) => {
        if (!cancelled) setAdvResult(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error(getErrorMessage(error, "Search failed."));
      })
      .finally(() => {
        if (!cancelled) setAdvLoading(false);
        if (submittedQuery.trim()) loadRecent();
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, submittedQuery, page, sortBy, clubId, fromDate, toDate]);

  useEffect(() => {
    if (!supportsClubDateFilters || clubsList.length > 0) return;
    api
      .get("/club/all", { params: { page: 1, pageSize: 100 } })
      .then((res) => setClubsList(res.data?.items || []))
      .catch(() => {});
  }, [supportsClubDateFilters]);

  const handleQueryChange = (val) => {
    setQuery(val);
    setShowSuggestions(true);
    clearTimeout(suggestTimer.current);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const data = await searchApi.getSuggestions(val.trim(), 8);
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
  };

  const runSearch = (q) => {
    const trimmed = (q ?? query).trim();
    setShowSuggestions(false);
    setActiveTab("all");
    setPage(1);
    setClubId("");
    setFromDate("");
    setToDate("");
    setSortBy(SearchSortBy.Relevance);
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleSuggestionClick = (s) => {
    setShowSuggestions(false);
    if (s.type === SearchEntityType.Users) navigate(`/profile/${s.id}`);
    else if (s.type === SearchEntityType.Clubs) navigate(`/clubs/${s.id}`);
    else runSearch(s.label);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setClubId("");
    setFromDate("");
    setToDate("");
    setSortBy(SearchSortBy.Relevance);
  };

  const handleDeleteRecent = async (id) => {
    setDeletingId(id);
    try {
      await searchApi.deleteRecent(id);
      setRecent((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove search."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearRecent = async () => {
    setClearingRecent(true);
    try {
      await searchApi.clearRecent();
      setRecent([]);
      toast.success("Search history cleared.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to clear search history."));
    } finally {
      setClearingRecent(false);
    }
  };

  const renderUserCard = (u) => (
    <Link
      key={`u-${u.id}`}
      to={`/profile/${u.id}`}
      className="glass-card-hover rounded-2xl p-4 flex items-center gap-3"
    >
      <img src={avatarFor(u.name, u.profileImage)} alt={u.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-red-400/30 flex-shrink-0" />
      <div className="min-w-0">
        <p className="font-bold text-gray-800 dark:text-white truncate">{u.name}</p>
        {u.userName && <p className="text-xs text-gray-400 truncate">@{u.userName}</p>}
        {u.department && <p className="text-xs text-red-500 dark:text-red-400 truncate mt-0.5">{u.department}</p>}
      </div>
    </Link>
  );

  const renderClubCard = (c) => (
    <Link
      key={`c-${c.id}`}
      to={`/clubs/${c.id}`}
      className="glass-card-hover rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25">
        <Building2 className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-800 dark:text-white truncate">{c.name}</p>
        {c.description && <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>}
        <p className="text-xs text-gray-400 mt-0.5">{c.memberCount} members</p>
      </div>
    </Link>
  );

  const renderPostCard = (p) => (
    <Link
      key={`p-${p.id}`}
      to={`/post/${p.id}`}
      className="glass-card-hover rounded-2xl p-4 flex gap-3"
    >
      {p.imageUrl && (
        <img src={p.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{p.contentSnippet}</p>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-xs text-gray-400">
          <span className="font-medium text-gray-600 dark:text-gray-300">{p.userName}</span>
          {p.clubName && <><span>·</span><span>{p.clubName}</span></>}
          <span>·</span>
          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1 ml-auto"><Heart className="w-3 h-3" />{p.reactionCount}</span>
        </div>
      </div>
    </Link>
  );

  const renderEventCard = (ev) => (
    <Link
      key={`e-${ev.id}`}
      to="/events"
      className="glass-card-hover rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
        <CalendarClock className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-800 dark:text-white truncate">{ev.title}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3" />
          {new Date(ev.eventDate).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <p className="text-xs text-gray-400 truncate">{ev.clubName} · {ev.attendeeCount} attending</p>
      </div>
    </Link>
  );

  const renderGroupCard = (g) => (
    <Link
      key={`g-${g.id}`}
      to="/groups"
      className="glass-card-hover rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg">
        <UsersRound className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-800 dark:text-white truncate">{g.name}</p>
        <p className="text-xs text-gray-400">{g.memberCount} members · created {new Date(g.createdAt).toLocaleDateString()}</p>
      </div>
    </Link>
  );

  const renderFileCard = (f) => {
    const Icon = fileIconFor(f.fileType);
    return (
      <Link
        key={`f-${f.id}`}
        to="/files"
        className="glass-card-hover rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 dark:text-white truncate">{f.fileName}</p>
          <p className="text-xs text-gray-400 truncate">
            {f.fileType} · {formatBytes(f.size)}{f.clubName ? ` · ${f.clubName}` : ""}
          </p>
          <p className="text-xs text-gray-400">{f.uploaderName} · {new Date(f.uploadedAt).toLocaleDateString()}</p>
        </div>
      </Link>
    );
  };

  const RENDERERS = {
    [SearchEntityType.Users]: renderUserCard,
    [SearchEntityType.Clubs]: renderClubCard,
    [SearchEntityType.Posts]: renderPostCard,
    [SearchEntityType.Events]: renderEventCard,
    [SearchEntityType.Groups]: renderGroupCard,
    [SearchEntityType.Files]: renderFileCard,
  };

  const KEY_MAP = {
    [SearchEntityType.Users]: "users",
    [SearchEntityType.Clubs]: "clubs",
    [SearchEntityType.Posts]: "posts",
    [SearchEntityType.Events]: "events",
    [SearchEntityType.Groups]: "groups",
    [SearchEntityType.Files]: "files",
  };

  const emptyStateFor = (label) => (
    <EmptyState
      icon={SearchIcon}
      iconClassName="w-12 h-12 text-red-400"
      title={`No ${label} found`}
      message="Try a different search term or adjust your filters"
      cardClassName="glass-card rounded-3xl shadow-xl p-16 text-center col-span-full"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-16">
      <BackgroundDecoration blobs={2} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 space-y-6 sm:space-y-8">
        <div className="page-hero p-6 sm:p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="page-hero-icon">
                <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <span className="text-white/70 text-xs sm:text-sm font-medium flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Explore the Community
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Search</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative max-w-2xl">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search users, clubs, posts, events, groups, files..."
                  className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/15 border border-white/25 text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-4 focus:ring-white/20 focus:bg-white/20 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                    className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-white text-red-700 font-semibold text-sm hover:bg-white/90 transition-colors">
                  Search
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-40 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700/60 overflow-hidden animate-slideDown">
                  {suggestions.map((s) => {
                    const Icon = s.type === SearchEntityType.Users ? UsersIcon : Building2;
                    return (
                      <button
                        type="button"
                        key={`${s.type}-${s.id}`}
                        onMouseDown={() => handleSuggestionClick(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <Icon className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{s.label}</span>
                        <span className="text-[10px] text-gray-400 ml-auto uppercase tracking-wide">{s.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            const count =
              t.id === "all"
                ? globalResult?.totalResults
                : t.id === activeTab
                ? advResult?.totalCount
                : undefined;
            return (
              <button
                key={t.id}
                onClick={() => handleTabClick(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                  active ? "btn-primary" : "glass-card text-gray-600 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-800/40 border border-gray-200/50 dark:border-slate-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {typeof count === "number" && <span className="opacity-70 text-xs">({count})</span>}
              </button>
            );
          })}
        </div>

        {activeTab !== "all" && (
          <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {supportsClubDateFilters && (
              <>
                <select
                  value={clubId}
                  onChange={(e) => { setClubId(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="">All Clubs</option>
                  {clubsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-gray-400">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-gray-400">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200"
                  />
                </div>
              </>
            )}

            {(clubId || fromDate || toDate || sortBy !== SearchSortBy.Relevance) && (
              <button
                onClick={() => { setClubId(""); setFromDate(""); setToDate(""); setSortBy(SearchSortBy.Relevance); setPage(1); }}
                className="ml-auto text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reset filters
              </button>
            )}
          </div>
        )}

        {activeTab === "all" && (
          <>
            {!submittedQuery.trim() ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent searches */}
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="section-header mb-0">
                      <div className="section-header-icon"><Clock /></div>
                      <h2>Recent Searches</h2>
                    </div>
                    {recent.length > 0 && (
                      <button
                        onClick={handleClearRecent}
                        disabled={clearingRecent}
                        className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {recentLoading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                  ) : recent.length === 0 ? (
                    <p className="text-sm text-gray-400">No recent searches yet. Try searching for something above.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {recent.map((r) => (
                        <li key={r.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => runSearch(r.query)}
                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-left text-sm text-gray-700 dark:text-gray-200 transition-colors truncate"
                          >
                            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{r.query}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRecent(r.id)}
                            disabled={deletingId === r.id}
                            className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <div className="section-header">
                    <div className="section-header-icon"><TrendingUp /></div>
                    <h2>Trending Now</h2>
                    <span className="subtitle ml-auto">last 7 days</span>
                  </div>
                  {trendingLoading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                  ) : trending.length === 0 ? (
                    <p className="text-sm text-gray-400">Nothing trending yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {trending.map((t, i) => (
                        <button
                          key={t.query}
                          onClick={() => runSearch(t.query)}
                          className="badge-premium hover:scale-105 transition-transform"
                        >
                          <span className="font-bold">#{i + 1}</span> {t.query}
                          <span className="opacity-60">({t.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : globalLoading ? (
              <div className="glass-card rounded-3xl p-16 text-center text-gray-400">Searching...</div>
            ) : globalResult && globalResult.totalResults === 0 ? (
              emptyStateFor("results")
            ) : globalResult ? (
              <div className="space-y-8">
                {[
                  { key: "users", label: "Users", icon: UsersIcon, items: globalResult.users, render: renderUserCard, tab: SearchEntityType.Users },
                  { key: "clubs", label: "Clubs", icon: Building2, items: globalResult.clubs, render: renderClubCard, tab: SearchEntityType.Clubs },
                  { key: "posts", label: "Posts", icon: FileText, items: globalResult.posts, render: renderPostCard, tab: SearchEntityType.Posts },
                  { key: "events", label: "Events", icon: Calendar, items: globalResult.events, render: renderEventCard, tab: SearchEntityType.Events },
                  { key: "groups", label: "Groups", icon: UsersRound, items: globalResult.groups, render: renderGroupCard, tab: SearchEntityType.Groups },
                  { key: "files", label: "Files", icon: FolderOpen, items: globalResult.files, render: renderFileCard, tab: SearchEntityType.Files },
                ]
                  .filter((section) => section.items && section.items.length > 0)
                  .map((section) => (
                    <div key={section.key}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="section-header mb-0">
                          <div className="section-header-icon"><section.icon /></div>
                          <h2>{section.label}</h2>
                        </div>
                        <button
                          onClick={() => handleTabClick(section.tab)}
                          className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          See all <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.items.map(section.render)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}
          </>
        )}

        {activeTab !== "all" && (
          <div>
            {advLoading ? (
              <div className="glass-card rounded-3xl p-16 text-center text-gray-400">Searching...</div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(advResult?.[KEY_MAP[activeTab]] || []).map(RENDERERS[activeTab])}
                  {advResult && (advResult[KEY_MAP[activeTab]] || []).length === 0 &&
                    emptyStateFor(TABS.find((t) => t.id === activeTab)?.label.toLowerCase() || "results")}
                </div>

                {advResult && (
                  <Pagination
                    page={page}
                    totalPages={advResult.totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
