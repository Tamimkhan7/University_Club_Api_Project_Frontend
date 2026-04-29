import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Loader from "../components/Loader";
import { 
  Sparkles, RefreshCw, AlertCircle, TrendingUp, 
  Users, MessageCircle, Heart, ArrowUp, Zap,
  Coffee, Crown, Rocket
} from "lucide-react";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stats, setStats] = useState({ totalPosts: 0, totalReactions: 0, totalComments: 0 });
  const feedRef = useRef(null);

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
      
      // Calculate stats
      const totalReactions = res.data.reduce((sum, post) => sum + (post.reactionCount || 0), 0);
      const totalComments = res.data.reduce((sum, post) => sum + (post.commentCount || 0), 0);
      setStats({
        totalPosts: res.data.length,
        totalReactions,
        totalComments
      });
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
    
    // Scroll listener for scroll to top button
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
    <div className="max-w-2xl mx-auto px-4 sm:px-0 pb-10" ref={feedRef}>
      {/* Hero Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative text-center py-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg animate-pulse">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Feed
          </h1>
          <p className="text-slate-500 text-sm">Discover what's happening in your community</p>
        </div>
      </div>

      {/* Stats Cards */}
      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-md p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium">Posts</span>
            </div>
            <p className="text-xl font-bold text-slate-700">{stats.totalPosts}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
              <Heart className="w-4 h-4 fill-red-500" />
              <span className="text-xs font-medium">Reactions</span>
            </div>
            <p className="text-xl font-bold text-slate-700">{stats.totalReactions}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Comments</span>
            </div>
            <p className="text-xl font-bold text-slate-700">{stats.totalComments}</p>
          </div>
        </div>
      )}

      {/* Welcome Banner for New Users */}
      {posts.length === 0 && !error && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white text-center shadow-xl">
          <Coffee className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Welcome to UniClub!</h2>
          <p className="text-blue-100 text-sm mb-4">Join a club and start sharing your thoughts with the community</p>
          <button
            onClick={() => window.location.href = "/clubs"}
            className="bg-white text-blue-600 px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            Browse Clubs
          </button>
        </div>
      )}

      {/* Error Message with better design */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-700 mb-1">Unable to load feed</h4>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 text-red-600 text-sm font-medium hover:text-red-700 flex items-center gap-1 bg-red-100 px-3 py-1.5 rounded-lg"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Component */}
      <CreatePost reload={handlePostCreated} />

      {/* Feed Header with Refresh */}
      {posts.length > 0 && (
        <div className="flex justify-between items-center mb-4 mt-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-slate-600">Latest updates</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Feed"}
          </button>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No posts yet</h3>
          <p className="text-slate-500 mb-4">Be the first to create a post in your club!</p>
          <button
            onClick={() => {
              const textarea = document.querySelector('textarea');
              if (textarea) textarea.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => textarea?.focus(), 500);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition transform hover:scale-105"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post, index) => (
            <div key={post.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
              <PostCard 
                post={post} 
                onReact={handleRefresh}
                index={index}
              />
            </div>
          ))}
        </div>
      )}

      {/* End of Feed Message */}
      {posts.length > 5 && (
        <div className="text-center mt-8 py-6">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <Coffee className="w-4 h-4" />
            <span>You've reached the end</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Modern Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 group"
        >
          <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}

      {/* Floating Stats Button (Optional) */}
      {posts.length > 0 && (
        <div className="fixed bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-full shadow-lg px-4 py-2 text-xs font-medium text-slate-600 flex items-center gap-2 z-50 border border-slate-100">
          <TrendingUp className="w-3 h-3 text-blue-500" />
          <span>{posts.length} posts</span>
        </div>
      )}
    </div>
  );
}