import { useEffect, useState, useCallback } from "react";
import api, { getErrorMessage } from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Loader from "../components/Loader";
import { Sparkles, RefreshCw, AlertCircle, ChevronUp, Coffee, Flame, Users2, Bookmark, Compass } from "lucide-react";

const TABS = [
  { id: "global", label: "Global", icon: Compass, endpoint: "/feed/global" },
  { id: "following", label: "Following", icon: Users2, endpoint: "/feed/following" },
  { id: "trending", label: "Trending", icon: Flame, endpoint: "/feed/trending" },
  { id: "my-clubs-trending", label: "My Clubs", icon: Sparkles, endpoint: "/feed/my-clubs-trending" },
  { id: "saved", label: "Saved", icon: Bookmark, endpoint: "/feed/saved" },
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

  const currentEndpoint = TABS.find((t) => t.id === tab)?.endpoint || "/feed/global";

  const loadPosts = useCallback(
    async (targetPage = 1, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      try {
        const res = await api.get(currentEndpoint, {
          params: { page: targetPage, pageSize: 10 },
        });
        const data = res.data || {};
        setPosts(data.items || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError(getErrorMessage(err, "Failed to load posts. Please refresh the page."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentEndpoint]
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="relative mb-6 mt-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-white/30 dark:border-gray-700/50 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Your Feed
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Discover what's happening in your community</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      tab === t.id
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-red-600 text-sm font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "global" && (
          <div className="mb-6">
            <CreatePost reload={handlePostCreated} />
          </div>
        )}

        {posts.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-rose-600 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Latest Updates</span>
              <span className="text-xs text-gray-400">({posts.length} posts)</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 p-12 text-center border border-white/30 dark:border-gray-700/50">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {tab === "global" ? "Be the first to create a post!" : "Nothing to show in this tab yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReact={() => {}} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => loadPosts(page - 1)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => loadPosts(page + 1)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Next
            </button>
          </div>
        )}

        {posts.length > 5 && (
          <div className="text-center mt-8 py-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Coffee className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-gray-400 text-sm">You've reached the end • {posts.length} posts on this page</p>
          </div>
        )}

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-110 z-50 group"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
