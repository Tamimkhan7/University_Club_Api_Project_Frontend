import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import clubPrivacyApi, { ClubVisibility, ClubVisibilityLabels, InviteStatus } from "../../api/clubPrivacy";
import InviteCard from "./InviteCard";
import InviteUserModal from "./InviteUserModal";
import {
  Globe, Lock, Mail, ChevronDown, UserPlus, Loader2, ShieldCheck, Inbox,
} from "lucide-react";

const VISIBILITY_OPTIONS = [
  { value: ClubVisibility.Public, label: "Public", icon: Globe, hint: "Anyone can find and join this club." },
  { value: ClubVisibility.Private, label: "Private", icon: Lock, hint: "Visible in search, but joining requires approval." },
  { value: ClubVisibility.InviteOnly, label: "Invite Only", icon: Mail, hint: "Only invited users can join this club." },
];

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: InviteStatus.Pending, label: "Pending" },
  { value: InviteStatus.Accepted, label: "Accepted" },
  { value: InviteStatus.Declined, label: "Declined" },
  { value: InviteStatus.Revoked, label: "Revoked" },
];

export default function PrivacySection({ clubId, club, membership, onClubUpdated }) {
  const isAdmin = membership?.role === "Admin";
  const canManage = isAdmin || membership?.role === "Moderator";

  const currentVisibility = club?.visibility ?? ClubVisibility.Public;

  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const [invites, setInvites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(InviteStatus.Pending);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loadInvites = useCallback(
    async (targetPage = 1, targetStatus = statusFilter) => {
      setLoading(true);
      try {
        const res = await clubPrivacyApi.getClubInvites(clubId, {
          status: targetStatus,
          page: targetPage,
          pageSize: 10,
        });
        setInvites(res?.items || []);
        setPage(res?.page || 1);
        setTotalPages(res?.totalPages || 1);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load invites"));
      } finally {
        setLoading(false);
      }
    },
    [clubId, statusFilter]
  );

  useEffect(() => {
    if (canManage) loadInvites(1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, canManage, statusFilter]);

  const handleChangeVisibility = async (visibility) => {
    if (visibility === currentVisibility || updatingVisibility) return;
    setUpdatingVisibility(true);
    try {
      await clubPrivacyApi.updateVisibility(clubId, visibility);
      toast.success(`Club visibility updated to ${ClubVisibilityLabels[visibility]}.`);
      onClubUpdated?.({ visibility });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update visibility"));
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleRevoked = (inviteId) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  const handleInvited = (created) => {
    setShowInviteModal(false);
    if (statusFilter === "" || statusFilter === InviteStatus.Pending) {
      setInvites((prev) => [created, ...prev]);
    }
  };

  if (!canManage) {
    return (
      <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
        <div className="empty-state">
          <div className="icon">
            <ShieldCheck className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Admins &amp; Moderators only</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Privacy settings and invites are managed by the club's admins and moderators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Visibility */}
      <div className="glass-card rounded-3xl shadow-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Club Visibility</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAdmin ? "Choose who can find and join this club." : "Only the club Admin can change this."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {VISIBILITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = currentVisibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!isAdmin || updatingVisibility}
                onClick={() => handleChangeVisibility(opt.value)}
                className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                  active
                    ? "border-red-400 bg-red-50/60 dark:bg-red-900/20 shadow-md shadow-red-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800/40"
                } ${!isAdmin ? "cursor-default opacity-80" : "cursor-pointer"} disabled:opacity-60`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${active ? "text-red-500" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${active ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-200"}`}>
                    {opt.label}
                  </span>
                  {active && updatingVisibility && <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Invites */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-card rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value === "" ? "all" : f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === f.value
                  ? "btn-primary py-2 px-4"
                  : "border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-800/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowInviteModal(true)} className="btn-primary px-5 py-2.5">
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {loading ? (
        <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading invites...
        </div>
      ) : invites.length === 0 ? (
        <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
          <div className="empty-state">
            <div className="icon">
              <Inbox className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No invites found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter === "" ? "No invites have been sent for this club yet." : "Nothing to show for this filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map((inv) => (
            <InviteCard key={inv.id} invite={inv} mode="manage" onRevoked={handleRevoked} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
          <button
            disabled={page <= 1}
            onClick={() => loadInvites(page - 1)}
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
            onClick={() => loadInvites(page + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
          >
            Next
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      )}

      {showInviteModal && (
        <InviteUserModal
          clubId={clubId}
          clubName={club?.name}
          onClose={() => setShowInviteModal(false)}
          onInvited={handleInvited}
        />
      )}
    </div>
  );
}
