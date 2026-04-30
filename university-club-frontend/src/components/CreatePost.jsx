import { useState, useEffect } from "react";
import api from "../api/axios";
import { 
  Image, Send, Sparkles, X, Plus, Loader2, Users, AlertCircle,
  Camera, FileImage, Globe, Hash, Smile, Palette, Zap,
  CheckCircle, TrendingUp, Award, Clock, Rocket
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePost({ reload }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postType, setPostType] = useState("general");

  const emojis = ["😊", "🎉", "🔥", "💡", "🚀", "❤️", "👍", "😂", "😮", "🎨", "📚", "💪"];

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const loadClubs = async () => {
    try {
      const res = await api.get("/club/all");
      setClubs(res.data);
      if (res.data.length > 0) {
        setClubId(res.data[0].id.toString());
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      setError("Failed to load clubs");
      toast.error("Failed to load clubs");
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (error) setError("");
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError("");
  };

  const validateUrl = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg|bmp))$/i;
    return pattern.test(url);
  };

  const addEmoji = (emoji) => {
    setContent(content + emoji);
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
    setTimeout(() => setSelectedEmoji(null), 1000);
  };

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!content.trim() && !imageUrl.trim()) {
      setError("Please add some content or an image");
      toast.error("Please add some content or an image");
      return;
    }

    if (content.trim().length > 5000) {
      setError("Content is too long (max 5000 characters)");
      toast.error("Content is too long");
      return;
    }

    if (imageUrl && !validateUrl(imageUrl)) {
      setError("Please enter a valid image URL");
      toast.error("Invalid image URL");
      return;
    }

    if (!clubId) {
      setError("Please select a club");
      toast.error("Please select a club");
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/post/create", {
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        clubId: parseInt(clubId),
      });

      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setCharCount(0);
      setSuccess("✨ Post created successfully!");
      toast.success("Post created successfully!");
      
      if (reload) await reload();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMsg = error.response?.data?.message || "Failed to create post";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { icon: Rocket, text: "Exciting announcement!", color: "text-orange-500" },
    { icon: Award, text: "Achievement unlocked!", color: "text-yellow-500" },
    { icon: TrendingUp, text: "Let's discuss...", color: "text-green-500" },
    { icon: Zap, text: "Quick tip:", color: "text-blue-500" },
  ];

  const fillPrompt = (prompt) => {
    setContent(prompt);
    document.querySelector("textarea")?.focus();
  };

  if (clubs.length === 0 && !error) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-10 mb-6 text-center border border-slate-100">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-2xl opacity-20"></div>
          <div className="relative w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">No Clubs Available</h3>
        <p className="text-slate-500 mb-6">Join or create a club to start sharing your thoughts</p>
        <button
          onClick={() => window.location.href = "/clubs"}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          Browse Clubs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl mb-8 overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-3xl">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg animate-float">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-2xl tracking-tight">Create Post</h2>
            <p className="text-white/80 text-sm">Share something amazing with your community</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Success Message - Animated */}
        {success && (
          <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-green-700 text-sm flex items-center gap-3 animate-slideIn">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Error Message - Animated */}
        {error && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-3 animate-slideIn">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Post Type Selector */}
        <div className="mb-5 flex gap-2">
          {[
            { id: "general", label: "General", icon: Globe, color: "blue" },
            { id: "announcement", label: "Announcement", icon: Megaphone, color: "purple" },
            { id: "question", label: "Question", icon: HelpCircle, color: "green" },
            { id: "discussion", label: "Discussion", icon: MessageCircle, color: "orange" },
          ].map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setPostType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  postType === type.id
                    ? `bg-${type.color}-500 text-white shadow-lg scale-105`
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Club Selection - Modern Card */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-500" />
            Select Club
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none cursor-pointer transition-all duration-200"
            >
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Quick prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => fillPrompt(prompt.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs text-slate-600 transition-all duration-200 hover:scale-105"
                >
                  <Icon className={`w-3 h-3 ${prompt.color}`} />
                  {prompt.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Input - Modern Textarea */}
        <div className="mb-4">
          <div className={`relative transition-all duration-300 ${isFocused ? "transform scale-[1.01]" : ""}`}>
            <textarea
              placeholder="What's on your mind? Share your thoughts, ideas, or questions..."
              value={content}
              onChange={handleContentChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows="5"
              className={`w-full resize-none border-2 rounded-2xl p-5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200 ${
                isFocused ? "border-purple-300 shadow-lg" : "border-slate-200"
              }`}
              maxLength="5000"
              style={{ lineHeight: "1.6" }}
            />
            {/* Character Counter with Progress Bar */}
            <div className="absolute bottom-3 right-3">
              <div className={`text-xs px-2 py-1 rounded-full ${
                charCount > 4500 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
              }`}>
                {charCount}/5000
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                charCount > 4500 ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
              }`}
              style={{ width: `${(charCount / 5000) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl animate-scaleIn">
            <div className="flex gap-2 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-10 h-10 text-2xl hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image URL Input - Modern Design */}
        {showImageInput && (
          <div className="mb-5 animate-fadeIn">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <FileImage className="w-4 h-4 text-green-500" />
              Image URL
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <input
                type="url"
                placeholder="https://example.com/your-image.jpg"
                value={imageUrl}
                onChange={handleImageUrlChange}
                className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200"
              />
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              {imageUrl && (
                <button
                  onClick={removeImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {/* Image Preview with Animation */}
            {imageUrl && validateUrl(imageUrl) && (
              <div className="mt-4 relative group animate-scaleIn">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition"></div>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="relative rounded-2xl max-h-64 w-full object-contain bg-gradient-to-br from-slate-100 to-slate-50 p-3 shadow-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400?text=Invalid+Image+URL";
                  }}
                />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  Preview
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Modern Design */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Smile className="w-4 h-4" />
            Add Emoji
          </button>
          
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 ${
              showImageInput
                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl"
            } hover:scale-105`}
          >
            {showImageInput ? (
              <>
                <X className="w-4 h-4" />
                Remove Image
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
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:shadow-2xl transition-all duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publish Post
              </>
            )}
          </button>
        </div>

        {/* Footer Tips */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Add images for better engagement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-blue-500" />
            <span>Share with your club members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>Posts with images get 2x more reactions</span>
          </div>
        </div>
      </div>
    </div>
  );
}