import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/axios";
import recruitmentApi from "../../api/recruitment";
import ApplicationCard from "./ApplicationCard";
import ApplyModal from "./ApplyModal";
import {
  ClipboardList, Plus, ChevronDown, UserCheck, Loader2,
} from "lucide-react";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: 0, label: "Pending" },
  { value: 1, label: "Approved" },
  { value: 2, label: "Rejected" },
  { value: 3, label: "Withdrawn" },
];

export default function RecruitmentSection({ clubId, club, membership }) {
  const canManage = membership?.role === "Admin" || membership?.role === "Moderator";
  const isMember = !!membership?.isMember;

  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const [myApplication, setMyApplication] = useState(null);
  const [loadingMine, setLoadingMine] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const loadClubApplications = useCallback(
    async (targetPage = 1, targetStatus = statusFilter) => {
      setLoading(true);
      try {
        const res = await recruitmentApi.getClubApplications(clubId, {
          status: targetStatus,
          page: targetPage,
          pageSize: 10,
        });
        setApplications(res?.items || []);
        setPage(res?.page || 1);
        setTotalPages(res?.totalPages || 1);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load applications"));
      } finally {
        setLoading(false);
      }
    },
    [clubId, statusFilter]
  );

  const loadPendingCount = useCallback(async () => {
    try {
      const count = await recruitmentApi.getPendingCount(clubId);
      setPendingCount(typeof count === "number" ? count : count?.count || 0);
    } catch {
      /* ignore */
    }
  }, [clubId]);

  const loadMyApplication = useCallback(async () => {
    setLoadingMine(true);
    try {
      const res = await recruitmentApi.getMyApplications({ page: 1, pageSize: 50 });
      const mine = (res?.items || []).find((a) => String(a.clubId) === String(clubId));
      setMyApplication(mine || null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load your application status"));
    } finally {
      setLoadingMine(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (canManage) {
      loadClubApplications(1, statusFilter);
      loadPendingCount();
    } else if (!isMember) {
      loadMyApplication();
    }
  }, [clubId, canManage, isMember, statusFilter]);

  const handleChanged = (updated) => {
    if (!updated) return;
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    loadPendingCount();
  };

  const handleApplied = (created) => {
    setShowApplyModal(false);
    setMyApplication(created);
  };

  const handleWithdrawnOwn = () => {
    setMyApplication(null);
  };

  if (canManage) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 p-4 glass-card rounded-2xl shadow-lg">
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
              {f.value === 0 && pendingCount > 0 && (
                <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                <ClipboardList className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No applications found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {statusFilter === "" ? "No one has applied to this club yet." : "Nothing to show for this filter."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} mode="manage" onChanged={handleChanged} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
            <button
              disabled={page <= 1}
              onClick={() => loadClubApplications(page - 1)}
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
              onClick={() => loadClubApplications(page + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              Next
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isMember) {
    return (
      <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
        <div className="empty-state">
          <div className="icon">
            <UserCheck className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">You're already a member!</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Only club admins and moderators can review recruitment applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {loadingMine ? (
        <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Checking application status...
        </div>
      ) : myApplication ? (
        <ApplicationCard
          application={myApplication}
          mode="own"
          onRemoved={handleWithdrawnOwn}
        />
      ) : (
        <div className="glass-card rounded-3xl shadow-xl p-12 text-center">
          <div className="empty-state">
            <div className="icon">
              <ClipboardList className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Want to join {club?.name || "this club"}?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-5">
              Submit an application and a club admin will review it soon.
            </p>
            <button onClick={() => setShowApplyModal(true)} className="btn-primary px-6 py-2.5">
              <Plus className="w-4 h-4" />
              Apply to Join
            </button>
          </div>
        </div>
      )}

      {showApplyModal && (
        <ApplyModal
          clubId={clubId}
          clubName={club?.name}
          onClose={() => setShowApplyModal(false)}
          onApplied={handleApplied}
        />
      )}
    </div>
  );
}
