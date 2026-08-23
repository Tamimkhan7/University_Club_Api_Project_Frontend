import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import pollApi from "../../api/poll";
import { formatFullDateTime } from "../../utils/dateUtils";
import {
  BarChart3, Vote, Clock, Crown, CheckCircle2, XCircle,
  Trash2, Lock, Users, Sparkles, Loader2, CircleDot, Square, CheckSquare,
} from "lucide-react";

const POLL_TYPE_LABELS = { 0: "General", 1: "Election" };

function formatDate(d) {
  return formatFullDateTime(d, { includeYear: false });
}

export default function PollCard({ poll, currentUserId, isMember, canManage, isAdmin, onChanged, onDeleted }) {
  const [selected, setSelected] = useState([]);
  const [voting, setVoting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isElection = poll.type === 1;
  const now = Date.now();
  const hasEnded = now > new Date(poll.endDate).getTime();
  const hasStarted = now >= new Date(poll.startDate).getTime();

  const showResults = poll.isClosed || poll.hasVoted || hasEnded;
  const canVoteNow = isMember && !poll.isClosed && !poll.hasVoted && !hasEnded && hasStarted;

  let statusLabel = "Active";
  let statusClasses = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (poll.isClosed) {
    statusLabel = "Closed";
    statusClasses = "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  } else if (hasEnded) {
    statusLabel = "Ended";
    statusClasses = "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  } else if (!hasStarted) {
    statusLabel = "Scheduled";
    statusClasses = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }

  const toggleOption = (optionId) => {
    if (poll.isMultipleChoice) {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelected([optionId]);
    }
  };

  const submitVote = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one option");
      return;
    }
    setVoting(true);
    try {
      const updated = await pollApi.vote(poll.id, selected);
      toast.success("Vote recorded successfully!");
      onChanged?.(updated);
      setSelected([]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit vote"));
    } finally {
      setVoting(false);
    }
  };

  const handleClose = async () => {
    if (!confirm(`Close the poll "${poll.title}"? Members will no longer be able to vote.`)) return;
    setClosing(true);
    try {
      await pollApi.close(poll.id);
      toast.success("Poll closed successfully.");
      const refreshed = await pollApi.getById(poll.id);
      onChanged?.(refreshed);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to close poll"));
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete the poll "${poll.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await pollApi.remove(poll.id);
      toast.success("Poll deleted successfully.");
      onDeleted?.(poll.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete poll"));
      setDeleting(false);
    }
  };

  return (
    <div className="glass-card-hover rounded-3xl p-5 sm:p-6 transition-all duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              isElection
                ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25"
                : "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
            }`}
          >
            {isElection ? <Crown className="w-5 h-5 text-white" /> : <BarChart3 className="w-5 h-5 text-white" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">{poll.title}</h3>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}>
                {statusLabel}
              </span>
              {isElection && (
                <span className="badge-premium !text-amber-600 dark:!text-amber-400 !from-amber-500/10 !to-orange-500/10 !border-amber-200/50 dark:!border-amber-800/30">
                  <Crown className="w-3 h-3" />
                  Election
                </span>
              )}
            </div>
            {poll.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{poll.description}</p>
            )}
          </div>
        </div>

        {(canManage || isAdmin) && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {canManage && !poll.isClosed && (
              <button
                onClick={handleClose}
                disabled={closing}
                title="Close poll"
                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete poll"
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4 pl-[56px]">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {poll.isClosed ? "Closed" : hasEnded ? "Ended" : "Ends"} {formatDate(poll.endDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
        </span>
        {poll.creatorName && (
          <span className="text-gray-400 dark:text-gray-500">by {poll.creatorName}</span>
        )}
        {poll.isMultipleChoice && (
          <span className="text-gray-400 dark:text-gray-500">· Multiple choice</span>
        )}
      </div>

      <div className="pl-[56px] space-y-2.5">
        {showResults ? (
          poll.options.map((opt) => (
            <div key={opt.id} className="relative">
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 relative overflow-hidden ${
                  opt.votedByMe
                    ? "border-red-300 dark:border-red-700/60 bg-red-50/50 dark:bg-red-900/10"
                    : "border-gray-200/70 dark:border-gray-700/60"
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-500/15 dark:to-rose-500/15 transition-all duration-700 ease-out"
                  style={{ width: `${opt.percentage}%` }}
                />
                <span className="relative flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 min-w-0">
                  {opt.votedByMe && <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  <span className="truncate">{opt.text}</span>
                </span>
                <span className="relative flex items-center gap-2 flex-shrink-0 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {opt.percentage}%
                  <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                    ({opt.voteCount})
                  </span>
                </span>
              </div>
            </div>
          ))
        ) : canVoteNow ? (
          <>
            {poll.options.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOption(opt.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-red-400 bg-red-50/60 dark:bg-red-900/15 dark:border-red-700/60"
                      : "border-gray-200/70 dark:border-gray-700/60 hover:border-red-200 dark:hover:border-red-800/40"
                  }`}
                >
                  {poll.isMultipleChoice ? (
                    isSelected ? (
                      <CheckSquare className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    )
                  ) : isSelected ? (
                    <CircleDot className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  ) : (
                    <CircleDot className="w-4.5 h-4.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  )}
                  <span className="font-medium text-gray-700 dark:text-gray-200">{opt.text}</span>
                </button>
              );
            })}
            <button
              onClick={submitVote}
              disabled={voting || selected.length === 0}
              className="btn-primary w-full py-2.5 mt-1 text-sm"
            >
              {voting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Vote className="w-4 h-4" />
              )}
              Cast Vote
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 italic px-1 py-2">
            <XCircle className="w-4 h-4" />
            {!isMember
              ? "Join this club to vote in polls."
              : !hasStarted
              ? "This poll hasn't started yet."
              : "You can't vote on this poll right now."}
          </div>
        )}
      </div>
    </div>
  );
}
