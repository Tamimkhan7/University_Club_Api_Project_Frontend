import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  UserPlus, UserMinus, UserX, Users, Search, Sparkles, ShieldOff, Ban,
} from "lucide-react";

const TABS = [
  { id: "suggestions", label: "Suggestions" },
  { id: "common", label: "Common Interests" },
  { id: "followers", label: "My Followers" },
  { id: "following", label: "My Following" },
  { id: "blocked", label: "Blocked Users" },
  { id: "search", label: "Search" },
];

export default function Connections() {
  const [tab, setTab] = useState("suggestions");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async (targetPage = 1) => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case "suggestions":
          res = await api.get("/follow/suggestions");
          setList(res.data || []);
          setTotalPages(1);
          break;
        case "common":
          res = await api.get("/follow/suggestions/common");
          setList(res.data || []);
          setTotalPages(1);
          break;
        case "followers":
          res = await api.get("/follow/followers", { params: { page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        case "following":
          res = await api.get("/follow/following", { params: { page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        case "blocked":
          res = await api.get("/follow/blocked", { params: { page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        case "search":
          if (!searchTerm.trim()) {
            setList([]);
            setTotalPages(1);
            break;
          }
          res = await api.get("/follow/search", { params: { query: searchTerm.trim(), page: targetPage, pageSize: 20 } });
          setList(res.data?.items || []);
          setTotalPages(res.data?.totalPages || 1);
          break;
        default:
          break;
      }
      setPage(targetPage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const follow = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/follow/${id}`);
      toast.success("Followed!");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to follow"));
    } finally {
      setBusyId(null);
    }
  };

  const unfollow = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/follow/${id}`);
      toast.success("Unfollowed");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to unfollow"));
    } finally {
      setBusyId(null);
    }
  };

  const block = async (id) => {
    if (!confirm("Block this user?")) return;
    setBusyId(id);
    try {
      await api.post(`/follow/block/${id}`);
      toast.success("User blocked");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to block"));
    } finally {
      setBusyId(null);
    }
  };

  const unblock = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/follow/unblock/${id}`);
      toast.success("User unblocked");
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to unblock"));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">Connections</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.id ? "bg-red-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "search" && (
          <form onSubmit={handleSearch} className="mb-6 relative">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people..."
              className="w-full px-5 py-3 pl-12 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </form>
        )}

        {list.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-12 text-center border border-white/30">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nothing to show here.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((u) => (
              <div key={u.id} className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3">
                <img
                  src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=dc2626&color=fff`}
                  alt={u.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u.id}`} className="font-semibold text-sm text-gray-800 dark:text-white hover:text-red-600 truncate block">
                    {u.name}
                  </Link>
                  {u.mutualCount !== undefined && <p className="text-xs text-gray-400">{u.mutualCount} mutual connections</p>}
                  {u.followedAt && <p className="text-xs text-gray-400">Since {new Date(u.followedAt).toLocaleDateString()}</p>}
                  {u.blockedAt && <p className="text-xs text-gray-400">Blocked {new Date(u.blockedAt).toLocaleDateString()}</p>}
                </div>

                <div className="flex gap-1">
                  {tab === "blocked" ? (
                    <button onClick={() => unblock(u.id)} disabled={busyId === u.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300" title="Unblock">
                      <ShieldOff className="w-4 h-4" />
                    </button>
                  ) : tab === "following" ? (
                    <button onClick={() => unfollow(u.id)} disabled={busyId === u.id} className="p-2 bg-red-100 text-red-600 rounded-lg" title="Unfollow">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button onClick={() => follow(u.id)} disabled={busyId === u.id} className="p-2 bg-green-100 text-green-600 rounded-lg" title="Follow">
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button onClick={() => block(u.id)} disabled={busyId === u.id} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg" title="Block">
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
