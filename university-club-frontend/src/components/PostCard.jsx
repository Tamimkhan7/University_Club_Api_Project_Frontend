import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { 
  Heart, MessageCircle, ThumbsUp, Smile, Frown, Angry, Eye, X, 
  Share2, Bookmark, MoreHorizontal, Clock, Sparkles
} from "lucide-react";

export default function PostCard({ post, onReact }) {
  const [userReaction, setUserReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [isReacting, setIsReacting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const reactions = [
    { type: "Like", icon: ThumbsUp, color: "text-blue-500", bgColor: "bg-blue-50", emoji: "👍" },
    { type: "Love", icon: Heart, color: "text-red-500", bgColor: "bg-red-50", emoji: "❤️" },
    { type: "Haha", icon: Smile, color: "text-yellow-500", bgColor: "bg-yellow-50", emoji: "😂" },
    { type: "Wow", icon: Eye, color: "text-purple-500", bgColor: "bg-purple-50", emoji: "😮" },
    { type: "Sad", icon: Frown, color: "text-indigo-500", bgColor: "bg-indigo-50", emoji: "😢" },
    { type: "Angry", icon: Angry, color: "text-orange-500", bgColor: "bg-orange-50", emoji: "😡" },
  ];

  useEffect(() => {
    const loadReactionCount = async () => {
      try {
        const res = await api.get(`/reaction/count/${post.id}`);
        setReactionCount(res.data);
      } catch (error) {
        setReactionCount(post.reactionCount || 0);
      }
    };
    loadReactionCount();
  }, [post.id, post.reactionCount]);

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

  const getReactionEmoji = (type) => {
    const found = reactions.find(r => r.type === type);
    return found?.emoji || "👍";
  };

  const getReactionColor = (type) => {
    const found = reactions.find(r => r.type === type);
    return found?.color || "text-gray-500";
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
      setUserReaction(previousReaction);
      setReactionCount(previousCount);
      alert("Failed to remove reaction");
    } finally {
      setIsReacting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently";
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
      alert("📋 Post link copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return "";
    if (!isExpanded && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const shouldTruncate = post.content?.length > 300;
  const getUserInitials = (name) => name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-red-200/50">
      {/* Header with Subtle Gradient */}
      <div className="p-4 pb-3 relative">
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-r from-red-500/5 via-rose-500/5 to-red-500/5 pointer-events-none" />
        
        <div className="flex items-start justify-between relative">
          <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 flex-1">
            {post.userImage && !imageError ? (
              <img
                src={post.userImage}
                alt={post.userName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-red-500/30 group-hover:ring-red-500/50 transition-all duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {getUserInitials(post.userName)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-white hover:text-red-600 transition-colors duration-200">
                {post.userName || "Unknown User"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
                {post.clubName && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-red-500 font-medium">{post.clubName}</span>
                  </>
                )}
              </div>
            </div>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-20 animate-fadeInDown overflow-hidden">
                <button onClick={handleShare} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button onClick={() => setIsSaved(!isSaved)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                  <Bookmark className={`w-4 h-4 transition-all duration-200 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {truncateText(post.content)}
          </p>
          {shouldTruncate && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-red-500 text-sm font-medium mt-1 hover:text-red-600 transition-colors duration-200">
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
        
        {/* Image */}
        {post.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group/image">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="rounded-xl max-h-96 w-full object-contain transition-transform duration-500 group-hover/image:scale-105"
              onError={(e) => {
                e.target.src = "https://placehold.co/600x400?text=📷+Image+not+found";
              }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {userReaction && (
              <span className="text-lg transform transition-transform duration-200 hover:scale-110 cursor-default">
                {getReactionEmoji(userReaction)}
              </span>
            )}
          </div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">{reactionCount} {reactionCount === 1 ? 'reaction' : 'reactions'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">{post.commentCount || 0} comments</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <div className="relative flex-1">
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
              userReaction 
                ? `bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25` 
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105"
            }`}
          >
            <span className="text-base">{userReaction ? getReactionEmoji(userReaction) : "👍"}</span>
            <span className="text-sm font-medium">{userReaction ? getReactionEmoji(userReaction) + " • Clicked" : "React"}</span>
            {userReaction && (
              <button onClick={(e) => { e.stopPropagation(); removeReaction(); }} className="ml-1 text-white/80 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </button>

          {showReactions && (
            <div 
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className="absolute bottom-full left-0 mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex gap-1 z-20 animate-slideUp"
            >
              {reactions.map((reaction) => {
                const Icon = reaction.icon;
                return (
                  <button
                    key={reaction.type}
                    onClick={() => react(reaction.type)}
                    className={`p-2.5 rounded-xl hover:${reaction.bgColor} transition-all duration-200 hover:scale-125 ${reaction.color}`}
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 group/comment"
        >
          <MessageCircle className="w-4 h-4 transition-transform duration-200 group-hover/comment:scale-110" />
          <span className="text-sm font-medium">Comment</span>
        </Link>

        <button 
          onClick={handleShare} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 group/share"
        >
          <Share2 className="w-4 h-4 transition-transform duration-200 group-hover/share:scale-110" />
          <span className="text-sm font-medium hidden xs:inline">Share</span>
        </button>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}