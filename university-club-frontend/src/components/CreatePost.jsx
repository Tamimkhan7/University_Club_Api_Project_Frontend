import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../api/axios";
import { Image, Send, Sparkles, X, Loader2, Users, AlertCircle, Camera, Palette, Zap, Globe, Shield, Star, Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePost({ reload }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const res = await api.get("/club/my");
      const list = res.data || [];
      setClubs(list);
      if (list.length > 0) {
        setClubId(list[0].clubId.toString());
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load your clubs");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const submit = async () => {
    setError("");

    if (!content.trim() && !imageFile) {
      setError("Please add some content or an image");
      toast.error("Please add some content or an image");
      return;
    }

    if (!clubId) {
      setError("Please select a club");
      toast.error("Please select a club");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ClubId", clubId);
      formData.append("Content", content.trim());
      if (imageFile) formData.append("Image", imageFile);

      await api.post("/post/create", formData);

      setContent("");
      clearImage();
      setShowImageInput(false);
      toast.success("✨ Post created successfully!");

      if (reload) await reload();
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMsg = getErrorMessage(error, "Failed to create post");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (clubs.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer" />
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-float">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/40">
              <Star className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-6 mb-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Join a Club First
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            You need to be a member of a club before you can share your thoughts and connect with the community.
          </p>
          <button
            onClick={() => (window.location.href = "/clubs")}
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <span>Browse Clubs</span>
            <Globe className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl mb-6 transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/15 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer" />
      
      <div className="relative bg-gradient-to-r from-red-500 via-rose-500 via-pink-500 to-red-600 bg-[length:300%_100%] animate-shimmer px-6 py-5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
        
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 animate-ping" />
          </div>
          <div>
            <h2 className="font-bold text-white text-xl tracking-tight">Create Post</h2>
            <p className="text-white/60 text-xs font-medium">Share your thoughts with the community</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-7 relative">
        {error && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-sm border-l-4 border-red-500 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-shake shadow-lg shadow-red-500/5">
            <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <span className="font-semibold block">Oops!</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError("")} 
              className="ml-auto flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Club Selection */}
        <div className="mb-5 group">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md shadow-red-500/20">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Posting in
            </label>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium ml-auto">
              {clubs.length} clubs available
            </span>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Palette className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-600/80 rounded-2xl focus:border-red-400 focus:ring-4 focus:ring-red-400/10 outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-red-300 dark:hover:border-red-500/50 text-gray-700 dark:text-gray-200 font-medium"
            >
              {clubs.map((club) => (
                <option key={club.clubId} value={club.clubId} className="py-2">
                  {club.clubName} — {club.role}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl flex items-center justify-center group-hover:from-red-500/20 group-hover:to-rose-500/20 transition-all">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-4 group">
          <div className="relative">
            <textarea
              placeholder="What's on your mind? Share your thoughts, ideas, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              className="w-full resize-none bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-600/80 rounded-2xl p-5 pt-5 focus:border-red-400 focus:ring-4 focus:ring-red-400/10 outline-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-200 font-medium leading-relaxed hover:border-red-300/50 dark:hover:border-red-500/30"
              style={{ minHeight: "120px" }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                {content.length > 0 ? `${content.length} characters` : "Start typing..."}
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        {showImageInput && (
          <div className="mb-4 animate-slideDown">
            <div className="relative">
              <label className="flex items-center justify-center gap-3 w-full px-6 py-5 border-2 border-dashed border-gray-300/80 dark:border-gray-600/80 rounded-2xl cursor-pointer hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 group bg-white/40 dark:bg-gray-700/30 backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl flex items-center justify-center group-hover:from-red-500/20 group-hover:to-rose-500/20 transition-all">
                  <Camera className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors">
                    {imageFile ? imageFile.name : "Choose an image"}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {imageFile 
                      ? `${(imageFile.size / 1024).toFixed(0)} KB` 
                      : "PNG, JPG, GIF up to 10MB"}
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imageFile && (
                  <div className="ml-auto bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-xl border border-green-500/20">
                    ✓ Selected
                  </div>
                )}
              </label>
            </div>

            {imagePreview && (
              <div className="mt-4 relative group rounded-2xl overflow-hidden shadow-xl shadow-black/10">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-red-500/40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowImageInput(!showImageInput);
              if (showImageInput) clearImage();
            }}
            className={`group flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
              showImageInput
                ? "btn-primary"
                : "bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-2 border-gray-200/80 dark:border-gray-600/80 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50/50 dark:hover:bg-red-900/10"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              showImageInput 
                ? "bg-white/20" 
                : "bg-gradient-to-br from-red-500/10 to-rose-500/10 group-hover:from-red-500/20 group-hover:to-rose-500/20"
            }`}>
              <Image className={`w-4 h-4 ${showImageInput ? "text-white" : "text-gray-500 group-hover:text-red-500"} transition-colors`} />
            </div>
            <span className="text-sm">{showImageInput ? "Remove Image" : "Add Image"}</span>
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary flex items-center gap-2.5 ml-auto group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                <span>Publish Post</span>
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </>
            )}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>Be kind</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Community guidelines</span>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {content.length > 0 || imageFile ? "Ready to publish" : "Empty draft"}
          </div>
        </div>
      </div>
    </div>
  );
}