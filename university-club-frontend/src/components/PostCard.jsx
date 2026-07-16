import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Heart, MessageCircle, ThumbsUp, Smile, Frown, Angry, Eye, X,
  Share2, Bookmark, MoreHorizontal, Clock
} from "lucide-react";

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
  const [userReaction, setUserReaction] = useState(null); // "Like" | "Love" | ... | null
  const [showReactions, setShowReactions] = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [isReacting, setIsReacting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(!!post.isSaved);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [reactorFilter, setReactorFilter] = useState("all"); // "all" | reaction type label
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
      // Fallback to the individual count/my-reaction endpoints if summary fails
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const getReactionEmoji = (type) => REACTIONS.find((r) => r.type === type)?.emoji || "👍";

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
      alert("Failed to add reaction. Please try again.");
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
      alert("Failed to remove reaction");
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
    if (!isExpanded && text.length > maxLength) return text.substring(0, maxLength) + "...";
    return text;
  };

  const shouldTruncate = post.content?.length > 300;
  const getUserInitials = (name) => name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-red-200/50">
      <div className="p-4 pb-3 relative">
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
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                <button onClick={handleShare} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button onClick={() => { toggleSave(); setShowOptions(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                  <Bookmark className={`w-4 h-4 transition-all duration-200 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

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

        {post.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group/image">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="rounded-xl max-h-96 w-full object-contain transition-transform duration-500 group-hover/image:scale-105"
              onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Image+not+found"; }}
            />
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-1.5">
          {userReaction && (
            <span className="text-lg transform transition-transform duration-200 hover:scale-110 cursor-default">
              {getReactionEmoji(userReaction)}
            </span>
          )}
          <button onClick={openReactorsModal} className="text-gray-600 dark:text-gray-400 font-medium hover:underline">
            {reactionCount} {reactionCount === 1 ? "reaction" : "reactions"}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">{post.commentCount || 0} comments</span>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <div className="relative flex-1">
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
              userReaction
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105"
            }`}
          >
            <span className="text-base">{userReaction ? getReactionEmoji(userReaction) : "👍"}</span>
            <span className="text-sm font-medium">{userReaction ? `${getReactionEmoji(userReaction)} • ${userReaction}` : "React"}</span>
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
              className="absolute bottom-full left-0 mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex gap-1 z-20"
            >
              {REACTIONS.map((reaction) => {
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

      {showReactorsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReactorsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-white">Reactions</h3>
              <button onClick={() => setShowReactorsModal(false)} className="text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-1 p-3 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
              <button
                onClick={() => { setReactorFilter("all"); loadReactors("all"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${reactorFilter === "all" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                All
              </button>
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => { setReactorFilter(r.type); loadReactors(r.type); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${reactorFilter === r.type ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                >
                  {r.emoji} {r.type}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-110px)] divide-y divide-gray-100 dark:divide-gray-700">
              {reactors.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">No reactions yet.</p>
              ) : (
                reactors.map((r) => (
                  <div key={r.userId || r.id} className="flex items-center gap-3 p-3">
                    <img
                      src={r.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName || "U")}&background=dc2626&color=fff`}
                      alt={r.userName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white flex-1">{r.userName}</span>
                    {r.type !== undefined && <span className="text-lg">{REACTIONS[r.type]?.emoji}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
