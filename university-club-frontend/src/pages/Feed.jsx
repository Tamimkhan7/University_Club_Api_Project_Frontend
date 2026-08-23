import { useEffect, useState, useCallback, useRef } from "react";
import api, { getErrorMessage } from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Loader from "../components/Loader";
import StoriesBar from "../components/Story/StoriesBar";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import {
  Sparkles, RefreshCw, AlertCircle, ChevronUp, Coffee,
  Flame, Users2, Bookmark, Compass, Search, Home,
  Zap, Heart, Crown, Award, Star, Rocket, Gift,
  PartyPopper, UserCircle, TrendingUp, Globe
} from "lucide-react";

const TABS = [
  { id: "global", label: "Global", icon: Globe, endpoint: "/feed/global" },
  { id: "following", label: "Following", icon: Users2, endpoint: "/feed/following" },
  { id: "trending", label: "Trending", icon: Flame, endpoint: "/feed/trending" },
  { id: "my-clubs-trending", label: "My Clubs", icon: Sparkles, endpoint: "/feed/my-clubs-trending" },
  { id: "saved", label: "Saved", icon: Bookmark, endpoint: "/feed/saved" },
  { id: "browse", label: "Browse", icon: Search, endpoint: "/post/all" },
];

export default function Feed() {
  const [tab, setTab] = useState("global");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [browseQuery, setBrowseQuery] = useState("");
  const [browseClubId, setBrowseClubId] = useState("");
  const [browseUserId, setBrowseUserId] = useState("");

  const currentEndpoint = TABS.find((t) => t.id === tab)?.endpoint || "/feed/global";

  const requestIdRef = useRef(0);

  const loadPosts = useCallback(
  async (targetPage = 1, isRefresh = false) => {
    const myRequestId = ++requestIdRef.current;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      let res;
      if (tab === "browse" && browseQuery.trim()) {
        res = await api.get("/post/search", { params: { query: browseQuery.trim(), page: targetPage, pageSize: 10 } });
      } else if (tab === "browse") {
        res = await api.get("/post/all", { params: { clubId: browseClubId || undefined, userId: browseUserId || undefined, page: targetPage, pageSize: 10 } });
      } else {
        res = await api.get(currentEndpoint, { params: { page: targetPage, pageSize: 10 } });
      }

      if(myRequestId != requestIdRef.current)return;

        const data = res.data || {};
        const items = data.items || [];
        setPosts(items);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);

        if (items.length > 0) {
          Promise.all(
            items.map((p) =>
              api
                .get(`/comment/post/${p.id}`, { params: { page: 1, pageSize: 50 } })
                .then((cRes) => ({
                  id: p.id,
                  count: cRes.data?.total ?? cRes.data?.totalItems ?? cRes.data?.items?.length ?? p.commentCount ?? 0,
                }))
                .catch(() => ({ id: p.id, count: p.commentCount ?? 0 }))
            )
          ).then((counts) => {
            if(myRequestId !== requestIdRef.current)return;

            const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]));
            setPosts((prev) => prev.map((p) => ({ ...p, commentCount: countMap[p.id] ?? p.commentCount ?? 0 })));
          });
        }
      } catch (err) {
        console.error("Error loading posts:", err);
        setError(getErrorMessage(err, "Failed to load posts. Please refresh the page."));
      } finally {
        if(myRequestId === requestIdRef.current){
        setLoading(false);
        setRefreshing(false);
        }
      }
    },
    [currentEndpoint, tab, browseQuery, browseClubId, browseUserId]
  );

  useEffect(() => {
  
    loadPosts(1);
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadPosts]);

  const handleRefresh = () => loadPosts(page, true);
  const handlePostCreated = () => loadPosts(1, true);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <BackgroundDecoration />

      <div className="relative max-w-2xl mx-auto px-4 pb-12">
        {/* Hero Header */}
        <div className="relative mb-6 mt-4">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-red-600 to-amber-500 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
          <div className="relative glass-card rounded-3xl p-5 sm:p-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Your Feed
                  </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Discover what's happening in your community
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 px-3 py-1.5 rounded-xl border border-red-200/50 dark:border-red-800/30">
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {posts.length} posts
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "btn-primary py-2 px-3.5"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : ""}`} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <StoriesBar />

        {error && (
          <div className="bg-red-50/90 dark:bg-red-950/20 backdrop-blur-sm border border-red-200 dark:border-red-800/30 rounded-2xl p-5 mb-6 animate-shake shadow-lg shadow-red-500/5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800/30 transition-all duration-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "global" && (
          <div className="mb-6 animate-slideDown">
            <CreatePost reload={handlePostCreated} />
          </div>
        )}

        {tab === "browse" && (
          <div className="glass-card rounded-2xl p-4 mb-6 animate-slideDown">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Browse & Search Posts
              </span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); loadPosts(1); }} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={browseQuery}
                  onChange={(e) => setBrowseQuery(e.target.value)}
                  placeholder="Search by text..."
                  className="input-premium pl-10 pr-4 py-2.5"
                />
              </div>
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                Search
              </button>
            </form>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="flex-1 relative">
                <Users2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={browseClubId}
                  onChange={(e) => setBrowseClubId(e.target.value)}
                  placeholder="Club ID"
                  className="input-premium pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex-1 relative">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={browseUserId}
                  onChange={(e) => setBrowseUserId(e.target.value)}
                  placeholder="User ID"
                  className="input-premium pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
              <button
                onClick={() => { setBrowseQuery(""); setBrowseClubId(""); setBrowseUserId(""); loadPosts(1); }}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-rose-600 rounded-full" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Latest Updates
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {posts.length}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 group"
            >
              <RefreshCw className={`w-4 h-4 transition-all duration-300 ${refreshing ? "animate-spin" : "group-hover:rotate-180"}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <EmptyState
            iconNode={
              <div className="relative inline-flex">
                <Sparkles className="w-12 h-12 text-red-500" />
                <div className="absolute -top-2 -right-6 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
            }
            title="No posts yet"
            message={
              tab === "global"
                ? "Be the first to create a post and share your thoughts with the community!"
                : "Nothing to show in this tab yet. Try switching to another view."
            }
            cardClassName="glass-card rounded-3xl p-12 sm:p-16 text-center"
          >
            {tab === "global" && (
              <button
                onClick={() => document.querySelector("textarea")?.focus()}
                className="btn-primary mt-4 px-6 py-2.5"
              >
                <Sparkles className="w-4 h-4" />
                Create Post
              </button>
            )}
          </EmptyState>
        ) : (
          <div className="space-y-5 animate-fadeIn">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReact={() => {}} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => loadPosts(page - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              <ChevronUp className="w-4 h-4 rotate-90" />
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
                    onClick={() => loadPosts(pageNum)}
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
              onClick={() => loadPosts(page + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              Next
              <ChevronUp className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}

        {posts.length > 5 && (
          <div className="text-center mt-8 py-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
            </div>
            <div className="relative inline-flex items-center gap-2 glass-card px-6 py-3 rounded-2xl">
              <Coffee className="w-5 h-5 text-red-400 animate-bounce-slow" />
              <span className="text-gray-400 text-sm font-medium">
                You've reached the end • {posts.length} posts
              </span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
          </div>
        )}

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 btn-primary w-14 h-14 rounded-full flex items-center justify-center p-0 shadow-2xl shadow-red-500/30 animate-bounce-subtle"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}