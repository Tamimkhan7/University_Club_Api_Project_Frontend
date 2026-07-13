import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../api/axios";
import { Image, Send, Sparkles, X, Loader2, Users, AlertCircle } from "lucide-react";
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
      // Only clubs the user has actually joined can be posted to
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
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 p-8 mb-6 text-center border border-white/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Join a Club First</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">You need to join a club before you can post.</p>
        <button
          onClick={() => (window.location.href = "/clubs")}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
        >
          Browse Clubs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 mb-6 overflow-hidden border border-white/30 dark:border-gray-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/15">
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-4 relative overflow-hidden">
        <div className="flex items-center gap-3 relative">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-white text-xl">Create Post</h2>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-shake">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-red-600" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Club
          </label>
          <div className="relative">
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              {clubs.map((club) => (
                <option key={club.clubId} value={club.clubId}>
                  {club.clubName} ({club.role})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="w-full resize-none bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200 placeholder:text-gray-400"
          />
        </div>

        {showImageInput && (
          <div className="mb-4 animate-slideDown">
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-red-400 transition-colors">
              <Image className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Choose an image..."}
              </span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imagePreview && (
              <div className="mt-3 relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-xl max-h-48 object-contain border border-gray-200 dark:border-gray-600 shadow-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={() => {
              setShowImageInput(!showImageInput);
              if (showImageInput) clearImage();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              showImageInput
                ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                : "bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">{showImageInput ? "Remove Image" : "Add Image"}</span>
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ml-auto hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
