import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import storyApi from "../../api/story";
import {
  X, ChevronLeft, ChevronRight, Trash2, Eye, Pause, Play,
  MoreVertical, Loader2, Users as UsersIcon,
} from "lucide-react";

const IMAGE_DURATION_MS = 6000;

const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

/**
 * Full-screen story viewer.
 *
 * Props:
 *  - group: { userId, userName, userProfileImage, stories: StoryResponseDto[] }
 *  - isOwner: boolean - whether the current user owns this group of stories
 *  - startIndex: number
 *  - onClose()
 *  - onDeleted(storyId) - called after a story is deleted
 *  - onNext() / onPrev() - move to the neighboring user's story group (optional)
 */
export default function StoryViewerModal({
  group,
  isOwner,
  startIndex = 0,
  onClose,
  onDeleted,
  onNext,
  onPrev,
}) {
  const [index, setIndex] = useState(startIndex);
  const [progressPct, setProgressPct] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const stories = group?.stories || [];
  const current = stories[index];
  const viewedRef = useRef(new Set());
  const rafRef = useRef(null);
  const lastFrameRef = useRef(null);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
    lastFrameRef.current = null; // resync timing baseline after a pause toggle
  }, [paused]);

  const goNext = useCallback(() => {
    setShowMenu(false);
    setShowViewers(false);
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onNext ? onNext() : onClose?.();
    }
  }, [index, stories.length, onNext, onClose]);

  const goPrev = useCallback(() => {
    setShowMenu(false);
    setShowViewers(false);
    if (index > 0) {
      setIndex((i) => i - 1);
    } else {
      onPrev ? onPrev() : onClose?.();
    }
  }, [index, onPrev, onClose]);

  // Mark as viewed (not for the owner's own stories) once each story is shown.
  useEffect(() => {
    if (!current) return;
    if (!isOwner && !viewedRef.current.has(current.id)) {
      viewedRef.current.add(current.id);
      storyApi.view(current.id).catch(() => {});
    }
  }, [current, isOwner]);

  // Auto-advance progress bar. Images use a fixed duration; videos advance on `onEnded`.
  useEffect(() => {
    if (!current) return;
    setProgressPct(0);
    setPaused(false);
    pausedRef.current = false;
    elapsedRef.current = 0;
    lastFrameRef.current = null;

    if (current.mediaType === 1) {
      // Video: progress driven by the <video> element's timeupdate instead.
      return;
    }

    const tick = (now) => {
      if (!pausedRef.current) {
        if (lastFrameRef.current != null) {
          elapsedRef.current += now - lastFrameRef.current;
        }
        lastFrameRef.current = now;
      } else {
        lastFrameRef.current = null;
      }

      const pct = Math.min(100, (elapsedRef.current / IMAGE_DURATION_MS) * 100);
      setProgressPct(pct);
      if (pct >= 100) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // Handle keyboard navigation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  const handleVideoProgress = (e) => {
    const v = e.target;
    if (!v.duration) return;
    setProgressPct((v.currentTime / v.duration) * 100);
  };

  const handleTogglePause = () => setPaused((p) => !p);

  const openViewers = async () => {
    setShowMenu(false);
    setShowViewers(true);
    setLoadingViewers(true);
    try {
      const res = await storyApi.getViewers(current.id);
      setViewers(res || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load viewers"));
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await storyApi.remove(current.id);
      toast.success("Story deleted");
      onDeleted?.(current.id);
      if (stories.length <= 1) {
        onClose?.();
      } else if (index === stories.length - 1) {
        setIndex((i) => Math.max(0, i - 1));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete story"));
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black animate-fadeIn">
      <div className="relative w-full h-full sm:h-[92vh] sm:max-w-[420px] sm:rounded-3xl overflow-hidden bg-black">
        {/* Progress segments */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
          {stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < index ? "100%" : i === index ? `${progressPct}%` : "0%",
                  transition: i === index && s.mediaType !== 1 ? "width 0.05s linear" : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {group.userProfileImage ? (
              <img
                src={group.userProfileImage}
                alt={group.userName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/40">
                {getInitials(group.userName)}
              </div>
            )}
            <div>
              <p className="text-white text-sm font-semibold leading-tight">{group.userName || "Unknown"}</p>
              <p className="text-white/60 text-[11px] leading-tight">{timeAgo(current.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={handleTogglePause}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {isOwner && (
              <button
                onClick={() => setShowMenu((m) => !m)}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {showMenu && isOwner && (
              <div className="absolute top-11 right-0 w-44 glass-card rounded-2xl shadow-2xl py-1.5 z-30 animate-scaleIn">
                <button
                  onClick={openViewers}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                >
                  <Eye className="w-4 h-4 text-red-500" />
                  Viewers &middot; {current.viewCount}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete story
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {current.mediaType === 1 ? (
            <video
              key={current.id}
              src={current.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted={false}
              onTimeUpdate={handleVideoProgress}
              onEnded={goNext}
              ref={(el) => {
                if (el) paused ? el.pause() : el.play().catch(() => {});
              }}
            />
          ) : (
            <img
              key={current.id}
              src={current.mediaUrl}
              alt={current.caption || "Story"}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Tap zones for navigation */}
        <button
          aria-label="Previous story"
          onClick={goPrev}
          className="absolute left-0 top-0 h-full w-1/3 z-10"
        />
        <button
          aria-label="Next story"
          onClick={goNext}
          className="absolute right-0 top-0 h-full w-1/3 z-10"
        />

        {/* Desktop chevrons */}
        <div className="hidden sm:flex absolute inset-y-0 left-0 items-center pl-2 z-10 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="hidden sm:flex absolute inset-y-0 right-0 items-center pr-2 z-10 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Caption */}
        {current.caption && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-5 pt-14 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm leading-relaxed">{current.caption}</p>
          </div>
        )}

        {/* Viewers panel */}
        {showViewers && isOwner && (
          <div className="absolute inset-x-0 bottom-0 z-30 max-h-[55%] glass-card rounded-t-3xl p-5 animate-slideDown shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Viewers &middot; {viewers.length}
                </h3>
              </div>
              <button
                onClick={() => setShowViewers(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingViewers ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              </div>
            ) : viewers.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                No one has viewed this story yet.
              </p>
            ) : (
              <div className="space-y-2">
                {viewers.map((v) => (
                  <div key={v.userId} className="flex items-center gap-3">
                    {v.userProfileImage ? (
                      <img
                        src={v.userProfileImage}
                        alt={v.userName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs">
                        {getInitials(v.userName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {v.userName}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {timeAgo(v.viewedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
