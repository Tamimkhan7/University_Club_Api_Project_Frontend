import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Loader from "../components/Loader";
import { Sparkles, RefreshCw, AlertCircle, ChevronUp, Coffee } from "lucide-react";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError("");
    
    try {
      const res = await api.get("/feed/feed");
      setPosts(res.data);
    } catch (error) {
      console.error("Error loading posts:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load posts. Please refresh the page.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadPosts]);

  const handleRefresh = () => {
    loadPosts(true);
  };

  const handlePostCreated = () => {
    loadPosts(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 pb-12">
        
        {/* Hero */}
        <div className="relative mb-6 mt-4">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Feed
                </h1>
                <p className="text-gray-500 text-sm">Discover what's happening</p>
              </div>
              {posts.length > 0 && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 text-sm">{error}</p>
                <button onClick={handleRefresh} className="mt-2 text-red-600 text-sm font-medium hover:underline">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Post */}
        <div className="mb-6">
          <CreatePost reload={handlePostCreated} />
        </div>

        {/* Feed Header */}
        {posts.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Latest Updates</span>
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-5">Be the first to create a post in your club!</p>
            <button
              onClick={() => document.querySelector('textarea')?.focus()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReact={handleRefresh} />
            ))}
          </div>
        )}

        {/* End */}
        {posts.length > 5 && (
          <div className="text-center mt-8 py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Coffee className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">You've reached the end</p>
          </div>
        )}

        {/* Scroll to Top */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition transform hover:scale-110 z-50">
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}