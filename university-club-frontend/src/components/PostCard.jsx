import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { 
  Heart, MessageCircle, ThumbsUp, Smile, Frown, Angry, Eye, X, Users, 
  Share2, Bookmark, MoreHorizontal, Clock, Gift, Sparkles, Flame
} from "lucide-react";

export default function PostCard({ post, onReact }) {
  const [userReaction, setUserReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showReactionList, setShowReactionList] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [reactionList, setReactionList] = useState([]);
  const [isReacting, setIsReacting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingReactions, setLoadingReactions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const reactions = [
    { type: "Like", icon: ThumbsUp, color: "text-blue-500", bg: "hover:bg-blue-50", emoji: "👍", gradient: "from-blue-400 to-blue-600" },
    { type: "Love", icon: Heart, color: "text-red-500", bg: "hover:bg-red-50", emoji: "❤️", gradient: "from-red-400 to-red-600" },
    { type: "Haha", icon: Smile, color: "text-yellow-500", bg: "hover:bg-yellow-50", emoji: "😂", gradient: "from-yellow-400 to-yellow-600" },
    { type: "Wow", icon: Eye, color: "text-purple-500", bg: "hover:bg-purple-50", emoji: "😮", gradient: "from-purple-400 to-purple-600" },
    { type: "Sad", icon: Frown, color: "text-indigo-500", bg: "hover:bg-indigo-50", emoji: "😢", gradient: "from-indigo-400 to-indigo-600" },
    { type: "Angry", icon: Angry, color: "text-orange-500", bg: "hover:bg-orange-50", emoji: "😡", gradient: "from-orange-400 to-orange-600" },
  ];

  // Load reaction count
  useEffect(() => {
    const loadReactionCount = async () => {
      try {
        const res = await api.get(`/reaction/count/${post.id}`);
        setReactionCount(res.data);
      } catch (error) {
        console.error("Error loading reaction count:", error);
        setReactionCount(post.reactionCount || 0);
      }
    };
    loadReactionCount();
  }, [post.id, post.reactionCount]);

  // Load user's existing reaction
  useEffect(() => {
    const loadUserReaction = async () => {
      try {
        const res = await api.get(`/reaction/my/${post.id}`);
        if (res.data) {
          setUserReaction(res.data);
        }
      } catch (error) {
        console.error("Error loading user reaction:", error);
      }
    };
    loadUserReaction();
  }, [post.id]);

  // Load all reactions list
  const loadReactionList = async () => {
    if (reactionList.length > 0) {
      setShowReactionList(!showReactionList);
      return;
    }
    
    setLoadingReactions(true);
    try {
      const res = await api.get(`/reaction/all/${post.id}`);
      setReactionList(res.data);
      setShowReactionList(true);
    } catch (error) {
      console.error("Error loading reaction list:", error);
    } finally {
      setLoadingReactions(false);
    }
  };

  const getReactionEmoji = (type) => {
    const found = reactions.find(r => r.type === type);
    return found?.emoji || "👍";
  };

  const getReactionGradient = (type) => {
    const found = reactions.find(r => r.type === type);
    return found?.gradient || "from-gray-400 to-gray-600";
  };

  const react = async (type) => {
    if (isReacting) return;
    
    setIsReacting(true);
    const previousReaction = userReaction;
    const previousCount = reactionCount;
    
    if (userReaction === type) {
      setUserReaction(null);
      setReactionCount(prev => Math.max(0, prev - 1));
    } else {
      if (!userReaction) {
        setReactionCount(prev => prev + 1);
      }
      setUserReaction(type);
    }
    
    try {
      await api.post("/reaction/react", {
        postId: post.id,
        type: type,
      });
      
      if (onReact) onReact();
    } catch (error) {
      setUserReaction(previousReaction);
      setReactionCount(previousCount);
      alert("Failed to add reaction. Please try again.");
    } finally {
      setIsReacting(false);
      setShowReactions(false);
    }
  };

  const removeReaction = async () => {
    if (!userReaction) return;
    
    setIsReacting(true);
    const previousReaction = userReaction;
    const previousCount = reactionCount;
    
    setUserReaction(null);
    setReactionCount(prev => Math.max(0, prev - 1));
    
    try {
      await api.delete(`/reaction/remove/${post.id}`);
      if (onReact) onReact();
    } catch (error) {
      console.error("Error removing reaction:", error);
      setUserReaction(previousReaction);
      setReactionCount(previousCount);
      alert("Failed to remove reaction");
    } finally {
      setIsReacting(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getUserInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  const getReactionStats = () => {
    const stats = {};
    reactionList.forEach(r => {
      stats[r.type] = (stats[r.type] || 0) + 1;
    });
    return stats;
  };

  const topReactions = getReactionStats();
  const topReactionTypes = Object.keys(topReactions).slice(0, 3);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
      alert("Post link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fadeIn border border-slate-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* User Info Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar with status indicator */}
            <div className="relative">
              {post.userImage && !imageError ? (
                <img
                  src={post.userImage}
                  alt={post.userName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-300"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {getUserInitials(post.userName)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 hover:text-blue-600 transition text-base">
                  <Link to={`/profile/${post.userId}`}>{post.userName}</Link>
                </h3>
                {post.userRole === "Admin" && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Admin
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
                {post.clubName && (
                  <>
                    <span>•</span>
                    <span className="text-blue-500">in {post.clubName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <MoreHorizontal className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-fadeIn">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share Post
                </button>
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition text-sm"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`} />
                  {isSaved ? "Saved" : "Save Post"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-3">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-base">
            {post.content}
          </p>
        </div>
        
        {/* Post Image with overlay effect */}
        {post.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden bg-slate-100 relative group cursor-pointer">
            <img 
              src={post.imageUrl} 
              alt="Post" 
              className="rounded-xl max-h-96 w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Image+not+found";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
          </div>
        )}
      </div>

      {/* Stats Bar with modern design */}
      <div className="px-5 py-2 border-t border-slate-100 flex justify-between items-center">
        <div className="relative">
          <button
            onClick={loadReactionList}
            className="flex items-center gap-1.5 hover:text-blue-500 transition group"
          >
            <div className="flex -space-x-1">
              {topReactionTypes.map((type, idx) => (
                <span 
                  key={idx} 
                  className="text-sm transform transition-transform group-hover:scale-110"
                  style={{ marginLeft: idx > 0 ? '-4px' : '0' }}
                >
                  {getReactionEmoji(type)}
                </span>
              ))}
              {topReactionTypes.length === 0 && (
                <Heart className={`w-4 h-4 transition ${reactionCount > 0 ? "text-red-500" : "text-slate-400"}`} />
              )}
            </div>
            <span className="text-sm font-medium text-slate-600">{reactionCount}</span>
          </button>
          
          {/* Reaction List Popup - Modern */}
          {showReactionList && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden animate-slideIn">
              <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Reactions ({reactionList.length})
                </h4>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {loadingReactions ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : reactionList.length === 0 ? (
                  <div className="text-center py-4">
                    <Gift className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-slate-400 text-sm">No reactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reactionList.map((reaction, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                      >
                        <img
                          src={reaction.userImage || `https://ui-avatars.com/api/?name=${reaction.userName}&background=3b82f6&color=fff&bold=true`}
                          alt={reaction.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="flex-1 text-slate-700 font-medium text-sm">{reaction.userName}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center text-lg shadow-sm"
                          style={{ backgroundImage: `linear-gradient(to right, ${getReactionGradient(reaction.type)})` }}>
                          <span className="text-white text-xs">{getReactionEmoji(reaction.type)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">
            {post.commentCount || 0} {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>
      </div>

      {/* Action Buttons - Modern Design */}
      <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
        {/* Reactions Dropdown */}
        <div className="relative flex-1">
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              userReaction 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
            disabled={isReacting}
          >
            <span className="text-base">
              {userReaction ? reactions.find(r => r.type === userReaction)?.emoji || "👍" : "👍"}
            </span>
            <span className="text-sm font-medium">{userReaction || "React"}</span>
            {userReaction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeReaction();
                }}
                className="ml-1 text-white/80 hover:text-white transition"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </button>

          {/* Reactions Popup - Modern Animation */}
          {showReactions && (
            <div 
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 flex gap-2 z-10 animate-scaleIn"
            >
              {reactions.map((reaction) => {
                const Icon = reaction.icon;
                return (
                  <button
                    key={reaction.type}
                    onClick={() => react(reaction.type)}
                    className={`p-2 rounded-full transition-all duration-200 transform hover:scale-125 ${reaction.bg} ${reaction.color} hover:shadow-md`}
                    title={reaction.type}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Link
          to={`/post/${post.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all duration-200 group"
        >
          <MessageCircle className="w-4 h-4 group-hover:text-blue-500 transition" />
          <span className="text-sm font-medium">Comment</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all duration-200 group"
        >
          <Share2 className="w-4 h-4 group-hover:text-green-500 transition" />
          <span className="text-sm font-medium hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Trending Badge - if post has high engagement */}
      {(reactionCount > 10 || (post.commentCount || 0) > 5) && (
        <div className="absolute top-20 right-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
          <Flame className="w-3 h-3" />
          Trending
        </div>
      )}
    </div>
  );
}