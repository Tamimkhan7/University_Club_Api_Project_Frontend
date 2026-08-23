import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import { copyPostLink } from "../utils/clipboard";
import { formatRelativeTime as formatDate } from "../utils/dateUtils";
import { usePresence } from "../context/PresenceContext";
import toast from "react-hot-toast";
import {
  Heart, MessageCircle, Send, Trash2, ArrowLeft,
  Reply, MoreVertical, Edit2, Check, X, Save,
  Image as ImageIcon, Loader2, User,
  Clock, Flag, Share2, Bookmark,
  ChevronDown, ChevronUp, ThumbsUp, Quote,
  Sparkles, Shield, Award, Crown, Star,
  Zap, Rocket, Coffee, HeartHandshake,
  Building2, BookOpen, Target, Eye
} from "lucide-react";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [highlightedComment, setHighlightedComment] = useState(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const presence = usePresence([
    ...(post?.userId ? [post.userId] : []),
    ...comments.map((c) => c.userId),
  ]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyToName, setReplyToName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [replyCounts, setReplyCounts] = useState({});
  const [commentLikes, setCommentLikes] = useState({});

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostImage, setEditPostImage] = useState(null);
  const [editPostImagePreview, setEditPostImagePreview] = useState("");
  const [updatingPost, setUpdatingPost] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showReportBox, setShowReportBox] = useState(false);

  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").id;
    } catch {
      return null;
    }
  })();

  // formatDate এখন src/utils/dateUtils.js থেকে আসছে

  const loadData = async () => {
    setLoading(true);
    try {
      const [postRes, commentRes] = await Promise.all([
        api.get(`/post/${id}`),
        api.get(`/comment/post/${id}`, { params: { page: 1, pageSize: 50 } }),
      ]);

      setPost(postRes.data);
      const commentItems = commentRes.data?.items || [];
      setComments(commentItems);

      commentItems.forEach(async (c) => {
        try {
          const likeRes = await api.get(`/comment/${c.id}/likes`);
          setCommentLikes((prev) => ({ ...prev, [c.id]: likeRes.data?.likeCount || 0 }));
        } catch {
          /* ignore */
        }
      });
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.response?.status === 404) {
        toast.error("Post not found");
        navigate("/");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(getErrorMessage(error, "Failed to load post"));
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentRes = await api.get(`/comment/post/${id}`, { params: { page: 1, pageSize: 50 } });
      const commentItems = commentRes.data?.items || [];
      setComments(commentItems);

      commentItems.forEach(async (c) => {
        try {
          const likeRes = await api.get(`/comment/${c.id}/likes`);
          setCommentLikes((prev) => ({ ...prev, [c.id]: likeRes.data?.likeCount || 0 }));
        } catch {
          /* ignore */
        }
      });
    } catch (error) {
      console.error("Error refreshing comments:", error);
      toast.error(getErrorMessage(error, "Failed to refresh comments"));
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (!highlightId) return;
    api
      .get(`/comment/${highlightId}`)
      .then((res) => {
        setHighlightedComment(res.data);
        toast.success("Jumped to comment");
        setTimeout(() => {
          document.getElementById(`comment-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      })
      .catch((error) => {
        console.error("Failed to load highlighted comment:", error);
      });
  }, [searchParams]);

  const sendComment = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post("/comment/create", {
        postId: Number(id),
        content: text.trim(),
        parentCommentId: replyTo || undefined,
      });
      setText("");
      setReplyTo(null);
      setReplyToName("");
      loadComments();
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to post comment"));
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId) => {
    setDeleting(true);
    try {
      await api.delete(`/comment/${commentId}`);
      toast.success("Comment deleted");
      loadComments();
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete comment"));
    } finally {
      setDeleting(false);
    }
  };

  const updateComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    setUpdating(true);
    try {
      await api.put(`/comment/${commentId}`, { content: editCommentText.trim() });
      toast.success("Comment updated");
      setEditingComment(null);
      loadComments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update comment"));
    } finally {
      setUpdating(false);
    }
  };

  const toggleCommentLike = async (commentId) => {
    try {
      const res = await api.post(`/comment/${commentId}/like`);
      setCommentLikes((prev) => ({ ...prev, [commentId]: res.data?.likeCount || 0 }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to like comment"));
    }
  };

  const handleReply = (commentId, userName) => {
    setReplyTo(commentId);
    setReplyToName(userName);
    document.getElementById("comment-input")?.focus();
  };

  const toggleReplies = async (commentId) => {
    const isOpen = !!showReplies[commentId];
    if (!isOpen && !replies[commentId]) {
      try {
        const res = await api.get(`/comment/${commentId}/replies`);
        setReplies((prev) => ({ ...prev, [commentId]: res.data?.items || [] }));
      } catch (error) {
        console.error(error);
      }
    }
    setShowReplies((prev) => ({ ...prev, [commentId]: !isOpen }));
  };

  const startEditingComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const startEditingPost = () => {
    setIsEditingPost(true);
    setEditPostContent(post.content);
    setEditPostImagePreview(post.imageUrl || "");
  };

  const cancelEditingPost = () => {
    setIsEditingPost(false);
    setEditPostContent("");
    setEditPostImage(null);
    setEditPostImagePreview("");
  };

  const updatePost = async () => {
    if (!editPostContent.trim()) return;
    setUpdatingPost(true);
    try {
      const formData = new FormData();
      formData.append("Content", editPostContent.trim());
      if (editPostImage) formData.append("Image", editPostImage);

      await api.put(`/post/${id}`, formData);
      toast.success("Post updated");
      setIsEditingPost(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update post"));
    } finally {
      setUpdatingPost(false);
    }
  };

  const deletePost = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/post/${id}`);
      toast.success("Post deleted");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete post"));
    }
  };

  const toggleSave = async () => {
    try {
      if (post.isSaved) {
        await api.delete(`/post/unsave/${post.id}`);
        setPost((p) => ({ ...p, isSaved: false }));
        toast.success("Post unsaved");
      } else {
        await api.post(`/post/save/${post.id}`);
        setPost((p) => ({ ...p, isSaved: true }));
        toast.success("Post saved");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save post"));
    }
  };

  const handleShare = () => copyPostLink(post.id);

  const submitReport = async () => {
    try {
      await api.post(`/post/${id}/report`, { reason: reportReason });
      toast.success("Report submitted");
      setShowReportBox(false);
      setReportReason("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit report"));
    }
  };

  if (loading) return <Loader />;
  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          bare
          icon={MessageCircle}
          iconClassName="w-12 h-12 text-gray-400"
          title="Post not found"
        >
          <button
            onClick={() => navigate("/")}
            className="btn-primary px-6 py-2.5 mt-4"
          >
            Go back to feed
          </button>
        </EmptyState>
      </div>
    );
  }

  const canManage = post.userId === currentUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <BackgroundDecoration />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 px-4 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:translate-x-[-4px]"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium">Back</span>
        </button>

        <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/15">
          <div className="p-5 sm:p-6 pb-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-30" />
                  <img
                    src={post.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName || "U")}&background=dc2626&color=fff&bold=true&length=2&size=64`}
                    alt={post.userName}
                    className="relative w-14 h-14 rounded-full object-cover ring-2 ring-red-500/30 shadow-lg"
                  />
                  {presence[post.userId]?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    {post.userName || "Unknown User"}
                    <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                      <Crown className="w-3 h-3 inline" /> Member
                    </span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    {post.clubName && (
                      <>
                        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                        <span className="text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          in {post.clubName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                {showDeleteMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-2xl shadow-2xl z-20 overflow-hidden animate-slideDown">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-rose-500" />
                    {canManage && !isEditingPost && (
                      <button
                        onClick={() => { setShowDeleteMenu(false); startEditingPost(); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Post
                      </button>
                    )}
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-3 w-full px-4 py-3 text-green-600 dark:text-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-200 text-sm font-medium"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                      onClick={() => { setShowDeleteMenu(false); setShowReportBox(true); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-amber-600 dark:text-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all duration-200 text-sm font-medium"
                    >
                      <Flag className="w-4 h-4" /> Report
                    </button>
                    {canManage && (
                      <button
                        onClick={() => { setShowDeleteMenu(false); deletePost(); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 dark:hover:from-rose-900/20 dark:hover:to-red-900/20 transition-all duration-200 text-sm font-medium border-t border-gray-100 dark:border-gray-700"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {showReportBox && (
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/30 animate-slideDown">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Report this post</p>
                </div>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason (optional)"
                  rows="2"
                  className="input-premium"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={submitReport}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
                  >
                    Submit Report
                  </button>
                  <button
                    onClick={() => setShowReportBox(false)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isEditingPost ? (
              <div className="mt-5 space-y-4 animate-slideDown">
                <textarea
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  rows="6"
                  className="input-premium resize-none"
                  placeholder="Write your post content..."
                  autoFocus
                />
                <label className="flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 group">
                  <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-red-500 transition-colors">
                    {editPostImage ? editPostImage.name : "Replace image (optional)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditPostImage(file);
                        setEditPostImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                {editPostImagePreview && (
                  <div className="relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 p-2">
                    <img src={editPostImagePreview} alt="Preview" className="rounded-xl max-h-48 object-contain" />
                  </div>
                )}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={updatePost}
                    disabled={updatingPost}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {updatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEditingPost}
                    className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">{post.content}</p>
                </div>
                {post.imageUrl && (
                  <div className="mt-5 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 group/image relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full h-auto max-h-96 object-contain transition-transform duration-700 group-hover/image:scale-105"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400/e5e7eb/9ca3af?text=Image+not+found"; }}
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-6 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${post.isLiked ? "text-red-500 fill-red-500 animate-pulse" : "text-red-500"}`} />
                <span className="font-medium">{post.reactionCount || 0} reactions</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{post.commentCount || 0} comments</span>
              </div>
              <button
                onClick={toggleSave}
                className="flex items-center gap-2 hover:text-red-500 transition-all duration-200 ml-auto group/save"
              >
                <Bookmark className={`w-4 h-4 transition-all duration-300 ${post.isSaved ? "fill-red-500 text-red-500" : "group-hover/save:scale-110"}`} />
                <span className="text-xs font-medium">{post.isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/15">
          <div className="p-5 sm:p-6">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-5 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              Comments
              <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({comments.length})</span>
            </h3>

            {replyTo && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-3 mb-4 flex justify-between items-center border border-red-200 dark:border-red-800/30 animate-slideDown">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Replying to <span className="font-semibold">@{replyToName}</span>
                  </span>
                </div>
                <button
                  onClick={() => { setReplyTo(null); setReplyToName(""); }}
                  className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/20 px-3 py-1 rounded-xl transition-all"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  id="comment-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={replyTo ? `Reply to @${replyToName}...` : "Write a comment..."}
                  rows="3"
                  className="input-premium resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComment();
                    }
                  }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={sendComment}
                    disabled={sending || !text.trim()}
                    className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {comments.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                iconClassName="w-10 h-10 text-gray-400"
                iconWrapperClassName="w-20 h-20"
                title="No comments yet"
                titleClassName="text-gray-500 dark:text-gray-400 font-medium"
                message="Be the first to start the conversation!"
                messageClassName="text-gray-400 dark:text-gray-500 text-sm mt-1"
                cardClassName="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl"
              />
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    id={`comment-${comment.id}`}
                    className={`bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 ${
                      highlightedComment?.id === comment.id ? "ring-2 ring-red-500 shadow-lg shadow-red-500/10" : ""
                    }`}
                  >
                    {editingComment === comment.id ? (
                      <div className="space-y-3 animate-slideDown">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows="3"
                          className="input-premium resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateComment(comment.id)}
                            disabled={updating}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 text-sm font-medium"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={cancelEditingComment}
                            className="flex items-center gap-1.5 bg-gray-500 text-white px-4 py-1.5 rounded-xl hover:bg-gray-600 transition-all duration-300 text-sm font-medium"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={comment.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=dc2626&color=fff&bold=true&length=2`}
                                alt={comment.userName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/20"
                              />
                              {presence[comment.userId]?.isOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                              )}
                            </div>
                            <div>
                              <b className="text-sm text-gray-800 dark:text-white">{comment.userName}</b>
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditingComment(comment)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteComment(comment.id)}
                              disabled={deleting}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 ml-14 mt-2 leading-relaxed text-sm">{comment.content}</p>

                        <div className="ml-14 mt-2 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => toggleCommentLike(comment.id)}
                            className="flex items-center gap-1.5 text-blue-500 text-xs hover:text-blue-600 transition-all duration-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="font-medium">{commentLikes[comment.id] || 0}</span>
                          </button>
                          <button
                            onClick={() => handleReply(comment.id, comment.userName)}
                            className="flex items-center gap-1.5 text-red-500 text-xs hover:text-red-600 transition-all duration-200 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105"
                          >
                            <Reply className="w-3 h-3" /> Reply
                          </button>
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-1.5 text-gray-500 text-xs hover:text-gray-700 transition-all duration-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                          >
                            {showReplies[comment.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            {showReplies[comment.id] ? "Hide replies" : "View replies"}
                          </button>
                        </div>

                        {showReplies[comment.id] && (
                          <div className="ml-11 mt-3 space-y-2 border-l-2 border-red-200 dark:border-red-800/50 pl-4 animate-slideDown">
                            {(replies[comment.id] || []).length === 0 ? (
                              <p className="text-xs text-gray-400 py-2">No replies yet.</p>
                            ) : (
                              (replies[comment.id] || []).map((reply) => (
                                <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={reply.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName)}&background=f59e0b&color=fff&bold=true&length=2`}
                                      alt={reply.userName}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                      <b className="text-xs text-gray-800 dark:text-white">{reply.userName}</b>
                                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(reply.createdAt)}</p>
                                    </div>
                                    <button
                                      onClick={() => deleteComment(reply.id)}
                                      className="ml-auto text-gray-400 hover:text-red-500 transition-all duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-10 leading-relaxed">{reply.content}</p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}