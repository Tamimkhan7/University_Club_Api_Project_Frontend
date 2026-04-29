import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { 
  Heart, MessageCircle, Send, Trash2, ArrowLeft, 
  Reply, MoreVertical, Edit2, Check, X, Save,
  User, Calendar, Users 
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
  const [canDelete, setCanDelete] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [updating, setUpdating] = useState(false);
  
  // Post Edit States
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostImage, setEditPostImage] = useState("");
  const [updatingPost, setUpdatingPost] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // API: GET /api/post/{id}
      const postRes = await api.get(`/post/${id}`);
      // API: GET /api/comment/post/{postId}
      const commentRes = await api.get(`/comment/post/${id}`);
      
      setPost(postRes.data);
      setComments(commentRes.data);
      
      try {
        const profile = await api.get("/user/profile");
        setCanDelete(profile.data.id === postRes.data.userId);
      } catch (err) {
        console.error("Error getting profile:", err);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.response?.status === 404) {
        alert("Post not found");
        navigate("/");
      } else if (error.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Failed to load post");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // API: PUT /api/post/update/{id}
  const updatePost = async () => {
    if (!editPostContent.trim() && !editPostImage.trim()) {
      alert("Please add some content or image");
      return;
    }

    setUpdatingPost(true);
    try {
      await api.put(`/post/update/${id}`, {
        content: editPostContent,
        imageUrl: editPostImage
      });
      setIsEditingPost(false);
      await loadData();
      alert("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert(error.response?.data?.message || "Failed to update post");
    } finally {
      setUpdatingPost(false);
    }
  };

  // API: PUT /api/comment/update/{id}
  const updateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert("Please write something");
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/comment/update/${commentId}`, {
        content: editCommentText
      });
      setEditingComment(null);
      setEditCommentText("");
      await loadData();
      alert("Comment updated successfully!");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert(error.response?.data?.message || "Failed to update comment");
    } finally {
      setUpdating(false);
    }
  };

  // API: POST /api/comment/create
  const sendComment = async () => {
    if (!text.trim()) {
      alert("Please write a comment");
      return;
    }

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
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(error.response?.data?.message || "Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  // API: DELETE /api/comment/delete/{id}
  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    
    setDeleting(true);
    try {
      await api.delete(`/comment/delete/${commentId}`);
      await loadData();
      alert("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  };

  // API: DELETE /api/post/delete/{id}
  const deletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone!")) return;
    
    try {
      await api.delete(`/post/delete/${id}`);
      alert("Post deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.message || "Failed to delete post");
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
    setEditPostImage(post?.imageUrl || "");
  };

  const startEditingComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  const cancelEditingPost = () => {
    setIsEditingPost(false);
    setEditPostContent("");
    setEditPostImage("");
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <Loader />;
  if (!post) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-400">Post not found</div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          Go back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Post Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src={post.user?.profileImage || `https://ui-avatars.com/api/?name=${post.user?.name}&background=3b82f6&color=fff&bold=true&size=64`}
                alt={post.user?.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div>
                <h2 className="font-bold text-xl text-slate-800">{post.user?.name || "Unknown User"}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {canDelete && !isEditingPost && (
              <div className="relative">
                <button
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <MoreVertical className="w-5 h-5 text-slate-500" />
                </button>
                {showDeleteMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 z-10">
                    <button
                      onClick={() => {
                        setShowDeleteMenu(false);
                        startEditingPost();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Post
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteMenu(false);
                        deletePost();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditingPost ? (
            <div className="mt-4 space-y-3">
              <textarea
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows="6"
                className="w-full resize-none"
                placeholder="Write your post content..."
                autoFocus
              />
              <input
                value={editPostImage}
                onChange={(e) => setEditPostImage(e.target.value)}
                placeholder="Image URL (optional)"
                className="w-full"
              />
              {editPostImage && (
                <img 
                  src={editPostImage} 
                  alt="Preview" 
                  className="rounded-xl max-h-48 object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x200?text=Invalid+URL";
                  }}
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={updatePost}
                  disabled={updatingPost}
                  className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  {updatingPost ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                <button
                  onClick={cancelEditingPost}
                  className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
              {post.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+not+found";
                    }}
                  />
                </div>
              )}
            </>
          )}
          
          <div className="flex gap-5 mt-5 pt-4 border-t border-slate-100 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>{post.reactions?.length || 0} reactions</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments?.length || 0} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <h3 className="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Comments ({comments.length})
          </h3>

          {replyTo && (
            <div className="bg-blue-50 rounded-xl p-3 mb-4 flex justify-between items-center animate-fadeIn">
              <span className="text-sm text-blue-700">
                Replying to <span className="font-semibold">@{replyToName}</span>
              </span>
              <button
                onClick={() => {
                  setReplyTo(null);
                  setReplyToName("");
                }}
                className="text-red-500 text-sm hover:text-red-600 font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <textarea
              id="comment-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyToName}...` : "Write a comment..."}
              rows="2"
              className="flex-1 resize-none"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendComment();
                }
              }}
            />
            <button
              onClick={sendComment}
              disabled={sending || !text.trim()}
              className="gradient-bg text-white px-6 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 rounded-xl p-4 transition hover:shadow-md">
                  {editingComment === comment.id ? (
                    <div>
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        rows="3"
                        className="w-full mb-2 resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(comment.id)}
                          disabled={updating}
                          className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditingComment}
                          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition text-sm"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <img
                            src={comment.userImage || `https://ui-avatars.com/api/?name=${comment.userName}&background=10b981&color=fff&bold=true`}
                            alt={comment.userName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <b className="text-sm text-slate-800">{comment.userName}</b>
                            <p className="text-xs text-slate-400">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingComment(comment)}
                            className="text-blue-400 hover:text-blue-600 transition p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-red-400 hover:text-red-600 transition p-1"
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 ml-10 mt-2 leading-relaxed">{comment.content}</p>
                      
                      <button
                        onClick={() => handleReply(comment.id, comment.userName)}
                        className="flex items-center gap-1 text-blue-500 text-xs ml-10 mt-2 hover:text-blue-600 transition"
                      >
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-10 mt-3 space-y-2 border-l-2 border-blue-200 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.userImage || `https://ui-avatars.com/api/?name=${reply.userName}&background=f59e0b&color=fff&bold=true`}
                                    alt={reply.userName}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <div>
                                    <b className="text-xs text-slate-800">{reply.userName}</b>
                                    <p className="text-xs text-slate-400">
                                      {formatDate(reply.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteComment(reply.id)}
                                  className="text-red-400 hover:text-red-600 transition"
                                  disabled={deleting}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{reply.content}</p>
                            </div>
                          ))}
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
  );
}