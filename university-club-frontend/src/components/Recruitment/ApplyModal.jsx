import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import recruitmentApi from "../../api/recruitment";
import Modal from "../Modal";
import { Send, Sparkles, ClipboardList, Loader2 } from "lucide-react";

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
    <Modal
      onClose={onClose}
      disableClose={submitting}
      icon={ClipboardList}
      title="Apply to Join"
      subtitle={clubName || "This club"}
    >
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
    </Modal>
  );
}
