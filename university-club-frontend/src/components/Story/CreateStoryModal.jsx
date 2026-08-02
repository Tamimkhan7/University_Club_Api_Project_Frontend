import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import storyApi from "../../api/story";
import { X, Camera, Image as ImageIcon, Video, Loader2, Sparkles, Upload } from "lucide-react";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB, must match backend StoryService.MaxStorySizeBytes
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".mp4", ".mov", ".webm"];

export default function CreateStoryModal({ onClose, onCreated }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const acceptFile = (f) => {
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      toast.error("Unsupported file type. Allowed: jpg, jpeg, png, mp4, mov, webm.");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("File size must be less than 25 MB.");
      return;
    }
    setFile(f);
    setIsVideo(f.type.startsWith("video/"));
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleFileChange = (e) => acceptFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please choose a photo or video first");

    setSubmitting(true);
    try {
      const created = await storyApi.create(file, caption.trim() || undefined);
      toast.success("Story posted!");
      onCreated?.(created);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to post story"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => !submitting && onClose?.()}
      />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-card rounded-3xl shadow-2xl p-6 sm:p-7 animate-scaleIn">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">Add to Story</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Shares for 24 hours</p>
            </div>
          </div>
          <button
            onClick={() => !submitting && onClose?.()}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={handleFileChange}
          />

          {!previewUrl ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tap to choose a photo or video
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  JPG, PNG, MP4, MOV or WEBM &middot; up to 25MB
                </p>
              </div>
              <div className="flex items-center gap-3 text-gray-300 dark:text-gray-600">
                <ImageIcon className="w-4 h-4" />
                <Video className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[340px] mx-auto">
              {isVideo ? (
                <video src={previewUrl} className="w-full h-full object-contain" controls />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Caption <span className="text-gray-300 dark:text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about this moment..."
              maxLength={300}
              rows={2}
              className="input-premium py-2.5 text-sm resize-none"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-right mt-1">
              {caption.length}/300
            </p>
          </div>

          <button type="submit" disabled={submitting || !file} className="btn-primary w-full py-3 text-sm mt-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {submitting ? "Posting..." : "Share to Story"}
          </button>
        </form>
      </div>
    </div>
  );
}
