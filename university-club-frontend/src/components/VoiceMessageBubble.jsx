import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";

const formatDuration = (totalSeconds) => {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

// Inline audio player rendered inside a chat bubble for MediaType.Voice
// messages (direct & group). `isMine` only drives the accent color so it
// matches the surrounding bubble - white-on-red for own messages, red-on-white
// for others' - keeping the existing chat color scheme intact.
export default function VoiceMessageBubble({ src, durationSeconds, isMine }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const accent = isMine ? "text-white" : "text-red-500";
  const trackBg = isMine ? "bg-white/25" : "bg-red-100 dark:bg-red-900/30";
  const fillBg = isMine ? "bg-white" : "bg-gradient-to-r from-red-500 to-rose-600";
  const btnBg = isMine
    ? "bg-white/20 hover:bg-white/30"
    : "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30";

  return (
    <div className="flex items-center gap-2.5 min-w-[190px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${btnBg} ${accent}`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={`h-1.5 rounded-full overflow-hidden ${trackBg}`}>
          <div
            className={`h-full rounded-full ${fillBg} transition-all duration-100`}
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        <div className={`flex items-center gap-1 text-[10px] ${isMine ? "text-white/70" : "text-gray-400"}`}>
          <Mic className="w-2.5 h-2.5" />
          {isPlaying || currentTime > 0
            ? `${formatDuration(currentTime)} / ${formatDuration(durationSeconds)}`
            : formatDuration(durationSeconds)}
        </div>
      </div>
    </div>
  );
}