import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Heart, MessageCircle, Send, Trash2, ArrowLeft,
  Reply, MoreVertical, Edit2, Check, X, Save,
  Image as ImageIcon, Loader2, User,
  Clock, Flag, Share2, Bookmark,
  ChevronDown, ChevronUp, ThumbsUp, Quote
} from "lucide-react";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
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
  const [replies, setReplies] = useState({}); // commentId -> [comments]
  const [showReplies, setShowReplies] = useState({});
  const [replyCounts, setReplyCounts] = useState({});
  const [commentLikes, setCommentLikes] = useState({}); // commentId -> count

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

      // fetch like counts for each top-level comment (best-effort)
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

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updatePost = async () => {
    if (!editPostContent.trim() && !editPostImage) {
      toast.error("Please add some content or image");
      return;
    }
    setUpdatingPost(true);
    try {
      const formData = new FormData();
      formData.append("Content", editPostContent);
      if (editPostImage) formData.append("Image", editPostImage);

      await api.put(`/post/update/${id}`, formData);
      setIsEditingPost(false);
      await loadData();
      toast.success("Post updated successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update post"));
    } finally {
      setUpdatingPost(false);
    }
  };

  const updateComment = async (commentId) => {
    if (!editCommentText.trim()) return toast.error("Please write something");
    setUpdating(true);
    try {
      await api.put(`/comment/update/${commentId}`, {
        postId: Number(id),
        content: editCommentText,
      });
      setEditingComment(null);
      setEditCommentText("");
      await loadData();
      toast.success("Comment updated successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update comment"));
    } finally {
      setUpdating(false);
    }
  };

  const sendComment = async () => {
    if (!text.trim()) return toast.error("Please write a comment");
    setSending(true);
    try {
      await api.post("/comment/create", {
        postId: Number(id),
        content: text,
        parentCommentId: replyTo,
      });
      setText("");
      setReplyTo(null);
      setReplyToName("");
      await loadData();
      toast.success("Comment posted!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to post comment"));
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await api.delete(`/comment/delete/${commentId}`);
      await loadData();
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete comment"));
    } finally {
      setDeleting(false);
    }
  };

  const deletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone!")) return;
    try {
      await api.delete(`/post/delete/${id}`);
      toast.success("Post deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete post"));
    }
  };

  const toggleSave = async () => {
    try {
      if (post.isSaved) {
        await api.delete(`/post/unsave/${id}`);
      } else {
        await api.post(`/post/save/${id}`);
      }
      setPost((p) => ({ ...p, isSaved: !p.isSaved }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const submitReport = async () => {
    try {
      await api.post("/post/report", { postId: Number(id), reason: reportReason.trim() || undefined });
      toast.success("Post reported successfully");
      setShowReportBox(false);
      setReportReason("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to report post"));
    }
  };

  const toggleCommentLike = async (commentId) => {
    try {
      await api.post(`/comment/${commentId}/toggle-like`);
      const likeRes = await api.get(`/comment/${commentId}/likes`);
      setCommentLikes((prev) => ({ ...prev, [commentId]: likeRes.data?.likeCount || 0 }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleReply = (commentId, userName) => {
    setReplyTo(commentId);
    setReplyToName(userName);
    document.getElementById("comment-input")?.focus();
  };

  const startEditingPost = () => {
    setIsEditingPost(true);
    setEditPostContent(post?.content || "");
    setEditPostImage(null);
    setEditPostImagePreview(post?.imageUrl || "");
  };

  const startEditingComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  const cancelEditingPost = () => {
    setIsEditingPost(false);
    setEditPostImage(null);
    setEditPostImagePreview("");
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const toggleReplies = async (commentId) => {
    const isOpen = !!showReplies[commentId];
    if (!isOpen && !replies[commentId]) {
      try {
        const res = await api.get(`/comment/${commentId}/replies`);
        setReplies((prev) => ({ ...prev, [commentId]: res.data || [] }));
        setReplyCounts((prev) => ({ ...prev, [commentId]: (res.data || []).length }));
      } catch (error) {
        console.error(error);
      }
    }
    setShowReplies((prev) => ({ ...prev, [commentId]: !isOpen }));
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(date).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Post link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (loading) return <Loader />;
  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Post not found</h3>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
          >
            Go back to feed
          </button>
        </div>
      </div>
    );
  }

  const canManage = post.userId === currentUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 mb-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 overflow-hidden border border-white/30 dark:border-gray-700/50">
          <div className="p-5 sm:p-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={post.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName || "U")}&background=dc2626&color=fff&bold=true&length=2&size=64`}
                  alt={post.userName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-red-500/30"
                />
                <div>
                  <h2 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">{post.userName || "Unknown User"}</h2>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    {post.clubName && (
                      <>
                        <span>•</span>
                        <span className="text-red-500 font-medium">in {post.clubName}</span>
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
                  <div className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden">
                    {canManage && !isEditingPost && (
                      <button
                        onClick={() => { setShowDeleteMenu(false); startEditingPost(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Post
                      </button>
                    )}
                    <button onClick={handleShare} className="flex items-center gap-3 w-full px-4 py-2.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition text-sm">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                      onClick={() => { setShowDeleteMenu(false); setShowReportBox(true); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition text-sm"
                    >
                      <Flag className="w-4 h-4" /> Report
                    </button>
                    {canManage && (
                      <button
                        onClick={() => { setShowDeleteMenu(false); deletePost(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition text-sm border-t border-gray-100 dark:border-gray-700"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {showReportBox && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Report this post</p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason (optional)"
                  rows="2"
                  className="w-full p-2 border border-amber-300 dark:border-amber-700 rounded-lg text-sm bg-white dark:bg-gray-900"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={submitReport} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600">
                    Submit
                  </button>
                  <button onClick={() => setShowReportBox(false)} className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isEditingPost ? (
              <div className="mt-5 space-y-4">
                <textarea
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  rows="6"
                  className="w-full resize-none p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-gray-50 dark:bg-gray-900 transition"
                  placeholder="Write your post content..."
                  autoFocus
                />
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-red-400 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">{editPostImage ? editPostImage.name : "Replace image (optional)"}</span>
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
                  <div className="relative group">
                    <img src={editPostImagePreview} alt="Preview" className="rounded-xl max-h-48 object-contain bg-gray-100 dark:bg-gray-700 p-2" />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={updatePost}
                    disabled={updatingPost}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {updatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button onClick={cancelEditingPost} className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-xl hover:bg-gray-600 transition-all duration-200">
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
                  <div className="mt-5 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group relative">
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full h-auto max-h-96 object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Image+not+found"; }}
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-5 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Heart className={`w-4 h-4 ${post.isLiked ? "text-red-500 fill-red-500" : "text-red-500"}`} />
                <span>{post.reactionCount || 0} reactions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount || 0} comments</span>
              </div>
              <button onClick={toggleSave} className="flex items-center gap-1.5 hover:text-red-500 transition ml-auto">
                <Bookmark className={`w-4 h-4 ${post.isSaved ? "fill-red-500 text-red-500" : ""}`} />
                <span className="text-xs">{post.isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 overflow-hidden border border-white/30 dark:border-gray-700/50">
          <div className="p-5 sm:p-6">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              Comments ({comments.length})
            </h3>

            {replyTo && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-4 flex justify-between items-center border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Replying to <span className="font-semibold">@{replyToName}</span>
                  </span>
                </div>
                <button onClick={() => { setReplyTo(null); setReplyToName(""); }} className="text-red-500 text-sm hover:text-red-600 font-medium flex items-center gap-1">
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center">
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
                  className="w-full resize-none p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-gray-50 dark:bg-gray-900 transition"
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
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Be the first to start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:shadow-red-500/5">
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows="3"
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-white dark:bg-gray-800 resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={() => updateComment(comment.id)} disabled={updating} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition text-sm">
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button onClick={cancelEditingComment} className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition text-sm">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              src={comment.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=dc2626&color=fff&bold=true&length=2`}
                              alt={comment.userName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500/20"
                            />
                            <div>
                              <b className="text-sm text-gray-800 dark:text-white">{comment.userName}</b>
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => startEditingComment(comment)} className="text-red-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteComment(comment.id)} disabled={deleting} className="text-red-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 ml-12 mt-2 leading-relaxed text-sm">{comment.content}</p>

                        <div className="ml-12 mt-2 flex items-center gap-3">
                          <button onClick={() => toggleCommentLike(comment.id)} className="flex items-center gap-1 text-blue-500 text-xs hover:text-blue-600 transition px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <ThumbsUp className="w-3 h-3" />
                            {commentLikes[comment.id] || 0}
                          </button>
                          <button onClick={() => handleReply(comment.id, comment.userName)} className="flex items-center gap-1 text-red-500 text-xs hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Reply className="w-3 h-3" /> Reply
                          </button>
                          <button onClick={() => toggleReplies(comment.id)} className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-700 transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            {showReplies[comment.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {showReplies[comment.id] ? "Hide replies" : "View replies"}
                          </button>
                        </div>

                        {showReplies[comment.id] && (
                          <div className="ml-11 mt-3 space-y-2 border-l-2 border-red-200 dark:border-red-800 pl-3">
                            {(replies[comment.id] || []).length === 0 ? (
                              <p className="text-xs text-gray-400">No replies yet.</p>
                            ) : (
                              (replies[comment.id] || []).map((reply) => (
                                <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={reply.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName)}&background=f59e0b&color=fff&bold=true&length=2`}
                                      alt={reply.userName}
                                      className="w-7 h-7 rounded-full"
                                    />
                                    <div>
                                      <b className="text-xs text-gray-800 dark:text-white">{reply.userName}</b>
                                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(reply.createdAt)}</p>
                                    </div>
                                    <button onClick={() => deleteComment(reply.id)} className="ml-auto text-red-400 hover:text-red-600 transition p-1">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-9">{reply.content}</p>
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
