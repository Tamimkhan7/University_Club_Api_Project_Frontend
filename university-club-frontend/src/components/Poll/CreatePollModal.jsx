import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import pollApi from "../../api/poll";
import { X, Plus, Trash2, Sparkles, BarChart3, Crown, Loader2 } from "lucide-react";

function defaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  // format for <input type="datetime-local">
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreatePollModal({ clubId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(0); // 0 = General, 1 = Election
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [endDate, setEndDate] = useState(defaultEndDate());
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const updateOption = (index, value) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => setOptions((prev) => [...prev, ""]);

  const removeOption = (index) => {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Please enter a poll title");

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    const distinctOptions = [...new Set(cleanOptions)];
    if (distinctOptions.length < 2) {
      return toast.error("A poll needs at least 2 distinct options");
    }

    const endDateIso = new Date(endDate).toISOString();
    if (new Date(endDateIso).getTime() <= Date.now()) {
      return toast.error("End date must be in the future");
    }

    setSubmitting(true);
    try {
      const created = await pollApi.create(clubId, {
        title: title.trim(),
        description: description.trim() || null,
        type,
        isMultipleChoice,
        endDate: endDateIso,
        options: distinctOptions,
      });
      toast.success("Poll created successfully!");
      onCreated?.(created);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create poll"));
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
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">Create Poll</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Ask your club members something</p>
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best time for the next event?"
              maxLength={200}
              className="input-premium py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Description <span className="text-gray-300 dark:text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context..."
              maxLength={1000}
              rows={2}
              className="input-premium py-2.5 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType(0)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                    type === 0
                      ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setType(1)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                    type === 1
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  Election
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Ends at</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-premium py-2.5 text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMultipleChoice}
              onChange={(e) => setIsMultipleChoice(e.target.checked)}
              className="w-4 h-4 rounded accent-red-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Allow selecting multiple options
            </span>
          </label>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Options</label>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">min. 2</span>
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    maxLength={200}
                    className="input-premium py-2 text-sm flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add option
            </button>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm mt-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {submitting ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </div>
    </div>
  );
}
