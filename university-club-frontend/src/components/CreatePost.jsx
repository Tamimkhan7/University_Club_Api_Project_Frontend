import { useState, useEffect } from "react";
import api from "../api/axios";
import { Image, Send, Sparkles, X, Plus, Loader2, Users, AlertCircle } from "lucide-react";

export default function CreatePost({ reload }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const res = await api.get("/club/all");
      setClubs(res.data);
      if (res.data.length > 0) {
        setClubId(res.data[0].id.toString());
      } else {
        setError("No clubs available. Please join or create a club first.");
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      setError("Failed to load clubs. Please refresh the page.");
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError("");
  };

  const validateUrl = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
    return pattern.test(url);
  };

  const submit = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");

    // Validation
    if (!content.trim() && !imageUrl.trim()) {
      setError("Please add some content or an image");
      return;
    }

    if (content.trim().length > 5000) {
      setError("Content is too long (max 5000 characters)");
      return;
    }

    if (imageUrl && !validateUrl(imageUrl)) {
      setError("Please enter a valid image URL (jpg, png, gif, webp, svg)");
      return;
    }

    if (!clubId) {
      setError("Please select a club");
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/post/create", {
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        clubId: parseInt(clubId),
      });

      // Reset form
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setSuccess("Post created successfully!");
      
      // Reload posts
      if (reload) {
        await reload();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setShowImageInput(false);
  };

  if (clubs.length === 0 && !error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Clubs Available</h3>
        <p className="text-slate-500 mb-4">Join or create a club to start posting</p>
        <button
          onClick={() => window.location.href = "/clubs"}
          className="gradient-bg text-white px-6 py-2 rounded-xl hover:shadow-lg transition"
        >
          Browse Clubs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="gradient-bg px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Create Post</h2>
            <p className="text-white/80 text-sm">Share something with your community</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Club Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Club
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 appearance-none cursor-pointer"
            >
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            What's on your mind?
          </label>
          <textarea
            placeholder="Write something amazing..."
            value={content}
            onChange={handleContentChange}
            rows="4"
            className="w-full resize-none border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 bg-slate-50 transition"
            maxLength="5000"
          />
          <div className="text-right text-xs text-slate-400 mt-1">
            {content.length}/5000
          </div>
        </div>

        {/* Image URL Input */}
        {showImageInput && (
          <div className="mb-4 animate-fadeIn">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Image URL
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={handleImageUrlChange}
                className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
              {imageUrl && (
                <button
                  onClick={removeImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Image Preview */}
            {imageUrl && validateUrl(imageUrl) && (
              <div className="mt-3 relative group">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="rounded-xl max-h-48 w-full object-contain bg-slate-100 p-2"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                  }}
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
              showImageInput
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {showImageInput ? (
              <>
                <X className="w-4 h-4" />
                Cancel Image
              </>
            ) : (
              <>
                <Image className="w-4 h-4" />
                Add Image
              </>
            )}
          </button>
          
          <button
            onClick={submit}
            disabled={loading || (!content.trim() && !imageUrl.trim())}
            className="flex items-center gap-2 gradient-bg text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Tip: Add images to make your post more engaging!
          </p>
        </div>
      </div>
    </div>
  );
}