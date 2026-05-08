import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Image, Send, Sparkles, X, Plus, Loader2, Users, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePost({ reload }) {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
      const res = await api.get("/club/all");
      setClubs(res.data);
      if (res.data.length > 0) {
        setClubId(res.data[0].id.toString());
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load clubs");
    }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg|bmp))$/i;
    return pattern.test(url);
  };

  const submit = async () => {
    setError("");

    if (!content.trim() && !imageUrl.trim()) {
      setError("Please add some content or an image");
      toast.error("Please add some content or an image");
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
      toast.success("✨ Post created successfully!");
      
      if (reload) await reload();
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMsg = error.response?.data?.message || "Failed to create post";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (clubs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center border">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Clubs Available</h3>
        <p className="text-slate-500 mb-6">Join or create a club to start sharing your thoughts.</p>
        <button
          onClick={() => window.location.href = "/clubs"}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition"
        >
          Browse Clubs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden border">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white" />
          <h2 className="font-bold text-white text-xl">Create Post</h2>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Club Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Club</label>
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500"
          >
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="w-full resize-none border-2 border-slate-200 rounded-xl p-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Image URL Input */}
        {showImageInput && (
          <div className="mb-4">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500"
            />
            {imageUrl && validateUrl(imageUrl) && (
              <div className="mt-3">
                <img src={imageUrl} alt="Preview" className="rounded-xl max-h-48 object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              showImageInput ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Image className="w-4 h-4" />
            {showImageInput ? "Remove Image" : "Add Image"}
          </button>
          
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-6 py-2 rounded-xl transition ml-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}