import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import recruitmentApi from "../../api/recruitment";
import { X, Send, Sparkles, ClipboardList, Loader2 } from "lucide-react";

export default function ApplyModal({ clubId, clubName, onClose, onApplied }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await recruitmentApi.apply(clubId, {
        message: message.trim() || null,
      });
      toast.success("Application submitted successfully!");
      onApplied?.(created);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit application"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={() => !submitting && onClose?.()}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-3xl shadow-2xl p-6 sm:p-7 animate-scaleIn">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">Apply to Join</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[240px]">
                {clubName || "This club"}
              </p>
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Message to reviewers <span className="text-gray-300 dark:text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the club admins why you'd like to join..."
              maxLength={1000}
              rows={5}
              className="input-premium py-2.5 text-sm resize-none"
            />
            <div className="text-right text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              {message.length}/1000
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting..." : "Submit Application"}
            {!submitting && <Sparkles className="w-4 h-4 opacity-60" />}
          </button>
        </form>
      </div>
    </div>
  );
}
