import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/axios";
import recruitmentApi from "../api/recruitment";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import ApplicationCard from "../components/Recruitment/ApplicationCard";
import {
  ClipboardList, Sparkles, Building2, Filter,
} from "lucide-react";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: 0, label: "Pending" },
  { value: 1, label: "Approved" },
  { value: 2, label: "Rejected" },
  { value: 3, label: "Withdrawn" },
];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await recruitmentApi.getMyApplications({ page: targetPage, pageSize: 10 });
      setApplications(res?.items || []);
      setPage(res?.page || 1);
      setTotalPages(res?.totalPages || 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load your applications"));
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, []);

  const handleRemoved = (applicationId) => {
    setApplications((prev) => prev.filter((a) => a.id !== applicationId));
  };

  const visibleApplications =
    statusFilter === "" ? applications : applications.filter((a) => a.status === statusFilter);

  if (initialLoad && loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <BackgroundDecoration blobs={2} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="page-hero p-6 sm:p-8 md:p-10 mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="relative">
            <span className="hero-pill mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Track Your Applications
            </span>
            <div className="flex items-center gap-3 mt-2 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">My Applications</h1>
            </div>
            <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed">
              Keep an eye on every club recruitment application you've submitted.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 p-4 glass-card rounded-2xl shadow-lg">
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value === "" ? "all" : f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === f.value
                  ? "btn-primary py-2 px-4"
                  : "border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-800/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
            Loading applications...
          </div>
        ) : visibleApplications.length === 0 ? (
          <EmptyState
            icon={Building2}
            iconClassName="w-12 h-12 text-gray-400"
            title="No applications yet"
            message="Browse clubs and apply to the ones you'd like to join."
            cardClassName="glass-card rounded-3xl shadow-xl p-16 text-center"
          >
            <Link to="/clubs" className="btn-primary px-6 py-2.5 inline-flex mt-4">
              Browse Clubs
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {visibleApplications.map((app) => (
              <ApplicationCard key={app.id} application={app} mode="own" onRemoved={handleRemoved} />
            ))}
          </div>
        )}

        {statusFilter === "" && (
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => load(p)} />
        )}
      </div>
    </div>
  );
}
