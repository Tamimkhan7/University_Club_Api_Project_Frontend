import { Trash2, Send, Loader2 } from "lucide-react";

const formatTimer = (totalSeconds) => {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

// Replaces the text input row while a voice message is being recorded. Sits
// inside the same p-4/border-t/backdrop container used by the normal message
// input bar in Messages.jsx and Groups.jsx, so it reuses the app's existing
// red/rose color scheme and rounded-2xl shape instead of introducing a new one.
export default function VoiceRecorderBar({ seconds, onCancel, onSend, sending }) {
  return (
    <div className="flex-1 flex items-center gap-3 bg-red-50/80 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800/40 rounded-2xl px-4 py-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
        {formatTimer(seconds)}
      </span>
      <span className="text-xs text-gray-400 flex-1 hidden sm:inline">Recording voice message...</span>
      <button
        type="button"
        onClick={onCancel}
        disabled={sending}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
        title="Cancel"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onSend}
        disabled={sending}
        className="btn-primary px-4 py-2 disabled:opacity-50 flex items-center gap-2"
        title="Send voice message"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  );
}