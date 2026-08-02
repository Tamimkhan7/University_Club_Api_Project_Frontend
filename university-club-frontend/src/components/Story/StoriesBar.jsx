import { useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { getErrorMessage } from "../../api/axios";
import storyApi from "../../api/story";
import CreateStoryModal from "./CreateStoryModal";
import StoryViewerModal from "./StoryViewerModal";
import { Plus, Camera } from "lucide-react";

const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

export default function StoriesBar() {
  const { user: me } = useContext(AuthContext);
  const [groups, setGroups] = useState([]); // UserStoriesDto[]
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null); // index into `groups`

  const loadFeed = useCallback(async () => {
    try {
      const res = await storyApi.getFeed();
      setGroups(res || []);
    } catch (error) {
      // Stay quiet on initial load failures - the stories bar is a nice-to-have,
      // not worth interrupting the whole feed with an error banner.
      console.error("Failed to load stories:", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const myGroup = groups.find((g) => g.userId === me?.id);
  const otherGroups = groups.filter((g) => g.userId !== me?.id);

  const openViewerFor = (groupIndex) => setViewerIndex(groupIndex);

  const handleCreated = () => {
    setShowCreate(false);
    loadFeed();
  };

  const markGroupViewed = (userId) => {
    setGroups((prev) =>
      prev.map((g) => (g.userId === userId ? { ...g, hasUnviewed: false } : g))
    );
  };

  const handleDeletedStory = (storyId) => {
    setGroups((prev) => {
      const updated = prev
        .map((g) => ({ ...g, stories: g.stories.filter((s) => s.id !== storyId) }))
        .filter((g) => g.stories.length > 0);
      return updated;
    });
  };

  const currentGroup = viewerIndex !== null ? groups[viewerIndex] : null;

  const closeViewer = () => setViewerIndex(null);

  const goToNextGroup = () => {
    if (viewerIndex === null) return;
    if (viewerIndex < groups.length - 1) {
      setViewerIndex(viewerIndex + 1);
    } else {
      closeViewer();
    }
  };

  const goToPrevGroup = () => {
    if (viewerIndex === null) return;
    if (viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    } else {
      closeViewer();
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar px-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="w-12 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 animate-fadeIn">
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-1 py-1">
        {/* My story / add story tile */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => (myGroup ? openViewerFor(groups.indexOf(myGroup)) : setShowCreate(true))}
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
          >
            <div
              className={`absolute inset-0 rounded-full ${
                myGroup?.hasUnviewed
                  ? "bg-gradient-to-tr from-red-500 via-rose-500 to-amber-400 p-[2.5px]"
                  : myGroup
                  ? "bg-gray-300 dark:bg-gray-600 p-[2px]"
                  : "border-2 border-dashed border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px]">
                {me?.profileImage ? (
                  <img
                    src={me.profileImage}
                    alt="You"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold">
                    {getInitials(me?.name)}
                  </div>
                )}
              </div>
            </div>

            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowCreate(true);
              }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-lg shadow-red-500/30"
            >
              <Plus className="w-3 h-3 text-white" />
            </span>
          </button>
          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-[64px] truncate">
            Your Story
          </span>
        </div>

        {/* Other users' stories */}
        {otherGroups.map((g) => (
          <div key={g.userId} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => openViewerFor(groups.indexOf(g))}
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
            >
              <div
                className={`absolute inset-0 rounded-full p-[2.5px] ${
                  g.hasUnviewed
                    ? "bg-gradient-to-tr from-red-500 via-rose-500 to-amber-400"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px]">
                  {g.userProfileImage ? (
                    <img
                      src={g.userProfileImage}
                      alt={g.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold">
                      {getInitials(g.userName)}
                    </div>
                  )}
                </div>
              </div>
            </button>
            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-[64px] truncate">
              {g.userName || "User"}
            </span>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
            <Camera className="w-4 h-4" />
            No stories yet &mdash; be the first to share one!
          </div>
        )}
      </div>

      {showCreate && (
        <CreateStoryModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      {currentGroup && (
        <StoryViewerModal
          group={currentGroup}
          isOwner={currentGroup.userId === me?.id}
          onClose={() => {
            markGroupViewed(currentGroup.userId);
            closeViewer();
          }}
          onDeleted={handleDeletedStory}
          onNext={() => {
            markGroupViewed(currentGroup.userId);
            goToNextGroup();
          }}
          onPrev={goToPrevGroup}
        />
      )}
    </div>
  );
}
