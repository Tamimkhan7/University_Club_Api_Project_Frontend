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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 pb-12">
        
        {/* Hero - Red Theme */}
        <div className="relative mb-6 mt-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-white/30 dark:border-gray-700/50 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Your Feed
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Discover what's happening in your community</p>
              </div>
              {posts.length > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Live Feed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error - Red Theme */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-5 mb-6 animate-shake">
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

        {/* Create Post */}
        <div className="mb-6">
          <CreatePost reload={handlePostCreated} />
        </div>

        {/* Feed Header - Red Theme */}
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

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 p-12 text-center border border-white/30 dark:border-gray-700/50">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-5">Be the first to create a post in your club!</p>
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  textarea.scrollIntoView({ behavior: 'smooth' });
                  textarea.focus();
                }
              }}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fadeIn">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard key={post.id} post={post} onReact={handleRefresh} />
              </div>
            ))}
          </div>
        )}

        {/* End - Red Theme */}
        {posts.length > 5 && (
          <div className="text-center mt-8 py-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Coffee className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-gray-400 text-sm">You've reached the end • {posts.length} total posts</p>
          </div>
        )}

        {/* Scroll to Top - Red Theme */}
        {showScrollTop && (
          <button 
            onClick={scrollToTop} 
            className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-110 z-50 group"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}