import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import pollApi from "../../api/poll";
import PollCard from "./PollCard";
import CreatePollModal from "./CreatePollModal";
import { BarChart3, Plus, ChevronDown, Filter } from "lucide-react";

export default function PollsSection({ clubId, currentUserId, membership }) {
  const [polls, setPolls] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isMember = !!membership?.isMember;
  const canManage = membership?.role === "Admin" || membership?.role === "Moderator";
  const isAdmin = membership?.role === "Admin";

  const loadPolls = useCallback(
    async (targetPage = 1, targetActiveOnly = activeOnly) => {
      setLoading(true);
      try {
        const res = await pollApi.getClubPolls(clubId, {
          activeOnly: targetActiveOnly,
          page: targetPage,
          pageSize: 10,
        });
        setPolls(res?.items || []);
        setPage(res?.page || 1);
        setTotalPages(res?.totalPages || 1);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load polls"));
      } finally {
        setLoading(false);
      }
    },
    [clubId, activeOnly]
  );

  useEffect(() => {
    loadPolls(1, activeOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, activeOnly]);

  const handleCreated = (created) => {
    setShowCreateModal(false);
    setPolls((prev) => [created, ...prev]);
  };

  const handleChanged = (updated) => {
    if (!updated) return;
    setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleted = (pollId) => {
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-card rounded-2xl shadow-lg">
        <button
          onClick={() => setActiveOnly((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeOnly
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800/40"
              : "border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
          }`}
        >
          <Filter className="w-4 h-4" />
          Active polls only
        </button>

        {canManage && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary px-5 py-2.5 text-sm">
            <Plus className="w-4 h-4" />
            Create Poll
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          Loading polls...
        </div>
      ) : polls.length === 0 ? (
        <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
          <div className="empty-state">
            <div className="icon">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {activeOnly ? "No active polls" : "No polls yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {canManage ? "Create a poll to hear from your members" : "Check back later for club polls"}
            </p>
            {canManage && !activeOnly && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-5 px-6 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                Create Poll
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUserId={currentUserId}
              isMember={isMember}
              canManage={canManage}
              isAdmin={isAdmin}
              onChanged={handleChanged}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
          <button
            disabled={page <= 1}
            onClick={() => loadPolls(page - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Page <span className="text-gray-900 dark:text-white">{page}</span> of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => loadPolls(page + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
          >
            Next
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreatePollModal
          clubId={clubId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
