import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import recruitmentApi from "../../api/recruitment";
import { formatFullDateTime as formatDate } from "../../utils/dateUtils";
import {
  Clock, CheckCircle2, XCircle, RotateCcw, MessageSquareText,
  Check, X, Loader2, Hash, CalendarDays,
} from "lucide-react";

const STATUS_META = {
  0: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  1: {
    label: "Approved",
    classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  2: {
    label: "Rejected",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  3: {
    label: "Withdrawn",
    classes: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    icon: RotateCcw,
  },
};


export default function ApplicationCard({ application, mode = "manage", onChanged, onRemoved }) {
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const status = STATUS_META[application.status] || STATUS_META[0];
  const StatusIcon = status.icon;
  const isPending = application.status === 0;

  const handleApprove = async () => {
    setApproving(true);
    try {
      const updated = await recruitmentApi.approve(application.id, { note: note.trim() || null });
      toast.success(`${application.userName || "Applicant"} approved!`);
      onChanged?.(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to approve application"));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      const updated = await recruitmentApi.reject(application.id, { note: note.trim() || null });
      toast.success(`Application rejected.`);
      onChanged?.(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reject application"));
    } finally {
      setRejecting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Withdraw this application?")) return;
    setWithdrawing(true);
    try {
      await recruitmentApi.withdraw(application.id);
      toast.success("Application withdrawn.");
      onRemoved?.(application.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to withdraw application"));
      setWithdrawing(false);
    }
  };

  return (
    <div className="glass-card-hover rounded-3xl p-5 sm:p-6 transition-all duration-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {mode === "manage" ? (
            <img
              src={
                application.userProfileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(application.userName || "U")}&background=dc2626&color=fff&bold=true`
              }
              alt={application.userName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 flex-shrink-0">
              <Hash className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {mode === "manage" ? (
                <Link
                  to={`/profile/${application.userId}`}
                  className="font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors truncate"
                >
                  {application.userName || "Unknown user"}
                </Link>
              ) : (
                <span className="font-bold text-gray-800 dark:text-white truncate">
                  {application.clubName || "Club application"}
                </span>
              )}
              <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Applied {formatDate(application.appliedAt)}
            </div>

            {application.message && (
              <div className="flex items-start gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700/50">
                <MessageSquareText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{application.message}</p>
              </div>
            )}

            {application.reviewNote && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic pl-1">
                Reviewer note: "{application.reviewNote}"
              </div>
            )}

            {application.reviewerName && application.reviewedAt && (
              <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 pl-1">
                Reviewed by {application.reviewerName} on {formatDate(application.reviewedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === "manage" && isPending && (
        <div className="mt-4 pl-[56px] space-y-2.5">
          {showNote ? (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for the applicant..."
              maxLength={500}
              rows={2}
              className="input-premium py-2 text-sm resize-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
            >
              + Add a note (optional)
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              disabled={approving || rejecting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={approving || rejecting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200/60 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Reject
            </button>
          </div>
        </div>
      )}

      {mode === "own" && isPending && (
        <div className="mt-4 pl-[56px]">
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
          >
            {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Withdraw Application
          </button>
        </div>
      )}
    </div>
  );
}
