import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Heart, MessageCircle, ThumbsUp, Smile, Frown, Angry, Eye, X,
  Share2, Bookmark, MoreHorizontal, Clock, Sparkles, Award,
  User, Zap, Flame, Crown, Star
} from "lucide-react";
import toast from "react-hot-toast";

// Helper functions
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

const getReactionEmoji = (type) => {
  const emojis = {
    Like: "👍",
    Love: "❤️",
    Haha: "😂",
    Wow: "😮",
    Sad: "😢",
    Angry: "😡"
  };
  return emojis[type] || "👍";
};

const getUserInitials = (name) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

// Must match Enums/ReactionType.cs exactly: Like=0, Love=1, Haha=2, Wow=3, Sad=4, Angry=5
const REACTIONS = [
  { type: "Like", value: 0, icon: ThumbsUp, color: "text-blue-500", bgColor: "bg-blue-50", emoji: "👍" },
  { type: "Love", value: 1, icon: Heart, color: "text-red-500", bgColor: "bg-red-50", emoji: "❤️" },
  { type: "Haha", value: 2, icon: Smile, color: "text-yellow-500", bgColor: "bg-yellow-50", emoji: "😂" },
  { type: "Wow", value: 3, icon: Eye, color: "text-purple-500", bgColor: "bg-purple-50", emoji: "😮" },
  { type: "Sad", value: 4, icon: Frown, color: "text-indigo-500", bgColor: "bg-indigo-50", emoji: "😢" },
  { type: "Angry", value: 5, icon: Angry, color: "text-orange-500", bgColor: "bg-orange-50", emoji: "😡" },
];

export default function PostCard({ post, onReact }) {
  const [userReaction, setUserReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [isReacting, setIsReacting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(!!post.isSaved);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [reactorFilter, setReactorFilter] = useState("all");
  const [reactors, setReactors] = useState([]);

  const loadSummary = async () => {
    try {
      const res = await api.get(`/reaction/summary/${post.id}`);
      const s = res.data;
      setReactionCount(s.total ?? 0);
      setUserReaction(
        s.myReaction !== null && s.myReaction !== undefined
          ? REACTIONS[s.myReaction]?.type ?? null
          : null
      );
    } catch (error) {
      console.error("Error loading reaction summary, falling back:", error);
      try {
        const [countRes, myRes] = await Promise.all([
          api.get(`/reaction/count/${post.id}`),
          api.get(`/reaction/my/${post.id}`),
        ]);
        setReactionCount(countRes.data?.count ?? 0);
        const myVal = myRes.data?.myReaction;
        setUserReaction(myVal !== null && myVal !== undefined ? REACTIONS[myVal]?.type ?? null : null);
      } catch (fallbackError) {
        console.error("Reaction fallback also failed:", fallbackError);
      }
    }
  };

  const loadReactors = async (filter) => {
    try {
      if (filter === "all") {
        const res = await api.get(`/reaction/all/${post.id}`, { params: { page: 1, pageSize: 50 } });
        setReactors(res.data?.items || []);
      } else {
        const reactionMeta = REACTIONS.find((r) => r.type === filter);
        const res = await api.get(`/reaction/by-type/${post.id}/${reactionMeta.value}`, { params: { page: 1, pageSize: 50 } });
        setReactors(res.data?.items || []);
      }
    } catch (error) {
      console.error("Error loading reactors:", error);
    }
  };

  const openReactorsModal = () => {
    setShowReactorsModal(true);
    setReactorFilter("all");
    loadReactors("all");
  };

  useEffect(() => {
    loadSummary();
  }, [post.id]);

  const react = async (typeLabel) => {
    if (isReacting) return;
    const reactionMeta = REACTIONS.find((r) => r.type === typeLabel);
    if (!reactionMeta) return;

    setIsReacting(true);
    try {
      const res = await api.post("/reaction/react", {
        postId: post.id,
        type: reactionMeta.value,
      });
      const s = res.data;
      setReactionCount(s.total ?? 0);
      setUserReaction(
        s.myReaction !== null && s.myReaction !== undefined
          ? REACTIONS[s.myReaction]?.type ?? null
          : null
      );
      if (onReact) onReact();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add reaction. Please try again.");
    } finally {
      setIsReacting(false);
      setShowReactions(false);
    }
  };

  const removeReaction = async () => {
    if (!userReaction || isReacting) return;
    setIsReacting(true);
    try {
      const res = await api.delete(`/reaction/remove/${post.id}`);
      const s = res.data;
      setReactionCount(s.total ?? 0);
      setUserReaction(null);
      if (onReact) onReact();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove reaction");
    } finally {
      setIsReacting(false);
    }
  };

  const toggleSave = async () => {
    try {
      if (isSaved) {
        await api.delete(`/post/unsave/${post.id}`);
        setIsSaved(false);
      } else {
        await api.post(`/post/save/${post.id}`);
        setIsSaved(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save post");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
      toast.success("📋 Post link copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return "";
    if (!isExpanded && text.length > maxLength) return text.substring(0, maxLength) + "...";
    return text;
  };

  const shouldTruncate = post.content?.length > 300;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-3xl hover:shadow-red-500/15 transition-all duration-500 overflow-hidden border border-gray-100/80 dark:border-gray-700/80 hover:border-red-200/50 dark:hover:border-red-800/30">
      
      {/* Premium Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl bg-gradient-to-br from-red-500/3 via-rose-500/3 to-red-500/3 pointer-events-none" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="p-5 pb-3 relative">
        {/* Header */}
        <div className="flex items-start justify-between relative">
          <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 flex-1 group/profile">
            {post.userImage && !imageError ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-30 group-hover/profile:opacity-50 transition-opacity duration-300" />
                <img
                  src={post.userImage}
                  alt={post.userName}
                  className="relative w-12 h-12 rounded-full object-cover ring-2 ring-red-500/30 group-hover/profile:ring-red-500/50 transition-all duration-300 group-hover/profile:scale-105"
                  onError={() => setImageError(true)}
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg shadow-green-500/30" />
              </div>
            ) : (
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/25 group-hover/profile:scale-105 transition-transform duration-300">
                {getUserInitials(post.userName)}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 truncate">
                  {post.userName || "Unknown User"}
                </h3>
                <div className="flex items-center gap-0.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-medium text-amber-500 dark:text-amber-400">Member</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
                {post.clubName && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      {post.clubName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group/options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover/options:text-gray-600 dark:group-hover/options:text-gray-300" />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-20 overflow-hidden animate-slideDown">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-rose-500" />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group/item"
                >
                  <Share2 className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                  Share
                </button>
                <button
                  onClick={() => { toggleSave(); setShowOptions(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group/item"
                >
                  <Bookmark className={`w-4 h-4 transition-all duration-300 ${isSaved ? "fill-red-500 text-red-500 group-hover/item:scale-110" : "group-hover/item:scale-110"}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">
            {truncateText(post.content)}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-red-500 text-sm font-medium mt-2 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 flex items-center gap-1"
            >
              {isExpanded ? (
                <>Show less <span className="text-xs">▲</span></>
              ) : (
                <>Read more <span className="text-xs">▼</span></>
              )}
            </button>
          )}
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 group/image relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
            <img
              src={post.imageUrl && post.imageUrl.startsWith("http") ? post.imageUrl : "/placeholder.png"}
              alt="Post content"
              className="w-full max-h-96 object-contain transition-transform duration-700 group-hover/image:scale-105"
              onError={(e) => { e.target.src = "https://placehold.co/600x400/e5e7eb/9ca3af?text=Image+not+found"; }}
            />
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="mx-5 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm bg-gradient-to-r from-gray-50/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-800/30 rounded-b-2xl">
        <div className="flex items-center gap-2">
          {userReaction && (
            <span className="text-lg transform transition-transform duration-200 hover:scale-110 cursor-default animate-bounce-subtle">
              {getReactionEmoji(userReaction)}
            </span>
          )}
          <button
            onClick={openReactorsModal}
            className="text-gray-600 dark:text-gray-400 font-medium hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 flex items-center gap-1"
          >
            {reactionCount > 0 && (
              <span className="flex items-center gap-0.5">
                {reactionCount}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {reactionCount === 1 ? "reaction" : "reactions"}
                </span>
              </span>
            )}
            {reactionCount === 0 && "Be the first to react"}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">{post.commentCount || 0}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <div className="relative flex-1">
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
              userReaction
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 hover:scale-105"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105"
            }`}
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">
              {userReaction ? getReactionEmoji(userReaction) : "👍"}
            </span>
            <span className="text-sm font-medium">
              {userReaction ? userReaction : "React"}
            </span>
            {userReaction && (
              <span
                onClick={(e) => { e.stopPropagation(); removeReaction(); }}
                className="ml-1 text-white/80 hover:text-white transition-colors p-0.5 hover:bg-white/20 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
          </button>

          {showReactions && (
            <div
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 flex gap-1 z-20 animate-slideUp"
            >
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200/50 dark:border-gray-700/50 rotate-45" />
              {REACTIONS.map((reaction) => {
                const Icon = reaction.icon;
                return (
                  <button
                    key={reaction.type}
                    onClick={() => react(reaction.type)}
                    className={`p-2.5 rounded-xl hover:${reaction.bgColor} transition-all duration-200 hover:scale-125 ${reaction.color} relative group/react`}
                    title={reaction.type}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover/react:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {reaction.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Link
          to={`/post/${post.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group/comment"
        >
          <MessageCircle className="w-4 h-4 transition-transform duration-200 group-hover/comment:scale-110" />
          <span className="text-sm font-medium">Comment</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group/share"
        >
          <Share2 className="w-4 h-4 transition-transform duration-200 group-hover/share:scale-110 group-hover/share:rotate-12" />
          <span className="text-sm font-medium hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Reactors Modal */}
      {showReactorsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowReactorsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-4 flex justify-between items-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
              <div className="relative flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">Reactions</h3>
              </div>
              <button
                onClick={() => setShowReactorsModal(false)}
                className="relative p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-3 border-b border-gray-100 dark:border-gray-700 overflow-x-auto scrollbar-hide bg-gray-50/50 dark:bg-gray-800/50">
              <button
                onClick={() => { setReactorFilter("all"); loadReactors("all"); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all duration-200 ${
                  reactorFilter === "all"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => { setReactorFilter(r.type); loadReactors(r.type); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all duration-200 flex items-center gap-1 ${
                    reactorFilter === r.type
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <span>{r.emoji}</span>
                  {r.type}
                </button>
              ))}
            </div>

            {/* Reactors List */}
            <div className="overflow-y-auto max-h-[calc(80vh-140px)] divide-y divide-gray-100 dark:divide-gray-700">
              {reactors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <Heart className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No reactions yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to react!</p>
                </div>
              ) : (
                reactors.map((r) => (
                  <div key={r.userId || r.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group/item">
                    <div className="relative">
                      <img
                        src={r.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName || "U")}&background=dc2626&color=fff&bold=true`}
                        alt={r.userName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover/item:ring-red-500/30 transition-all duration-200"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white flex-1 group-hover/item:text-red-600 dark:group-hover/item:text-red-400 transition-colors duration-200">
                      {r.userName}
                    </span>
                    {r.type !== undefined && (
                      <span className="text-lg transform transition-transform duration-200 hover:scale-125 cursor-default">
                        {REACTIONS[r.type]?.emoji}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s ease infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slideUp {
          animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}