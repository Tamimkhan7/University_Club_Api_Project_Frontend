import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import clubPrivacyApi, { InviteStatus, InviteStatusLabels } from "../../api/clubPrivacy";
import { formatFullDateTime as formatDate } from "../../utils/dateUtils";
import {
  Clock, CheckCircle2, XCircle, Ban, Trash2, Loader2, CalendarDays, Hash, Eye,
} from "lucide-react";

const STATUS_META = {
  [InviteStatus.Pending]: {
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  [InviteStatus.Accepted]: {
    classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  [InviteStatus.Declined]: {
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  [InviteStatus.Revoked]: {
    classes: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    icon: Ban,
  },
};

// formatDate এখন src/utils/dateUtils.js থেকে আসছে


export default function InviteCard({ invite, mode = "manage", onRevoked, onResponded, linkToDetails = true }) {
  const [revoking, setRevoking] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const status = STATUS_META[invite.status] ?? STATUS_META[InviteStatus.Pending];
  const StatusIcon = status.icon;
  const isPending = invite.status === InviteStatus.Pending;

  const handleRevoke = async () => {
    if (!confirm("Revoke this invite?")) return;
    setRevoking(true);
    try {
      await clubPrivacyApi.revokeInvite(invite.id);
      toast.success("Invite revoked.");
      onRevoked?.(invite.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to revoke invite"));
      setRevoking(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await clubPrivacyApi.acceptInvite(invite.id);
      toast.success(`You've joined ${invite.clubName || "the club"}!`);
      onResponded?.(invite.id, InviteStatus.Accepted);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to accept invite"));
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await clubPrivacyApi.declineInvite(invite.id);
      toast.success("Invite declined.");
      onResponded?.(invite.id, InviteStatus.Declined);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to decline invite"));
    } finally {
      setDeclining(false);
    }
  };

  return (
    <div className="glass-card-hover rounded-3xl p-5 sm:p-6 transition-all duration-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {mode === "manage" ? (
            <img
              src={
                invite.invitedUserName
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(invite.invitedUserName)}&background=dc2626&color=fff&bold=true`
                  : `https://ui-avatars.com/api/?name=U&background=dc2626&color=fff&bold=true`
              }
              alt={invite.invitedUserName}
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
                  to={`/profile/${invite.invitedUserId}`}
                  className="font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors truncate"
                >
                  {invite.invitedUserName || "Unknown user"}
                </Link>
              ) : (
                <Link
                  to={`/clubs/${invite.clubId}`}
                  className="font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors truncate"
                >
                  {invite.clubName || "A club"}
                </Link>
              )}
              <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
                <StatusIcon className="w-3 h-3" />
                {InviteStatusLabels[invite.status] ?? "Pending"}
              </span>
              {linkToDetails && (
                <Link
                  to={`/invites/${invite.id}`}
                  title="View invite details"
                  className="p-1 rounded-lg text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Invited {formatDate(invite.createdAt)}
            </div>

            {invite.inviterName && (
              <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 pl-1">
                Invited by {invite.inviterName}
              </div>
            )}

            {invite.respondedAt && (
              <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 pl-1">
                Responded {formatDate(invite.respondedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === "manage" && isPending && (
        <div className="mt-4 pl-[56px]">
          <button
            onClick={handleRevoke}
            disabled={revoking}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200/60 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Revoke Invite
          </button>
        </div>
      )}

      {mode === "own" && isPending && (
        <div className="mt-4 pl-[56px] flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={accepting || declining}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={accepting || declining}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200/60 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {declining ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
