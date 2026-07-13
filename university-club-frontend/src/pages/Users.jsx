import { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Search, Users as UsersIcon, Sparkles, UserPlus, UserMinus,
  ChevronRight, UserCheck, Star, TrendingUp,
} from "lucide-react";

const logoImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVifde8HHEEoz6yz-nSHMKMMRNOeHfCE-GoA&s";

export default function Users() {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followBusy, setFollowBusy] = useState({});
  const location = useLocation();

  const loadUsers = async (targetPage = 1, query = "") => {
    setLoading(true);
    try {
      const endpoint = query ? "/user/search" : "/user/all";
      const res = await api.get(endpoint, { params: { query, page: targetPage, pageSize: 20 } });
      const data = res.data || {};
      setUsers(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(getErrorMessage(error, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
      loadUsers(1, search);
    } else {
      loadUsers(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1, searchQuery.trim());
  };

  const toggleFollow = async (targetUser) => {
    setFollowBusy((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      if (targetUser.isFollowing) {
        await api.delete(`/user/follow/${targetUser.id}`);
      } else {
        await api.post(`/user/follow/${targetUser.id}`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isFollowing: !u.isFollowing } : u))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setFollowBusy((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const getRandomGradient = (id) => {
    const gradients = [
      "from-red-500 to-rose-500", "from-rose-500 to-red-600", "from-red-600 to-rose-500",
      "from-rose-600 to-red-500", "from-red-500 to-orange-500", "from-rose-500 to-pink-500",
      "from-red-600 to-rose-600", "from-rose-500 to-red-500",
    ];
    return gradients[id % gradients.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-red-500/25">
            <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">Loading community members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <img src={logoImage} alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Community Members</h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">Connect with fellow university students</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 shadow-lg">
                <span className="text-sm sm:text-base font-semibold">{users.length} Members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl shadow-red-500/10 p-4 sm:p-5 border border-white/30 dark:border-gray-700/50">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-white dark:bg-gray-900 transition-all duration-200"
              />
            </div>
            <button type="submit" className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 font-medium flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {users.map((u) => {
            const gradient = getRandomGradient(u.id);
            const isMe = me && me.id === u.id;
            return (
              <div
                key={u.id}
                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/15 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-red-200/50"
              >
                <Link to={`/profile/${u.id}`} className="block">
                  <div className="relative">
                    <div className={`h-28 sm:h-32 bg-gradient-to-r ${gradient}`}></div>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <img
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&size=120`}
                        alt={u.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                      />
                    </div>
                  </div>

                  <div className="pt-14 sm:pt-16 pb-2 px-4 text-center">
                    <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">{u.name}</h3>
                    {u.userName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">@{u.userName}</p>}
                    {(u.department || u.batch) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {[u.department, u.batch].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="px-4 pb-4">
                  {!isMe && (
                    <button
                      onClick={() => toggleFollow(u)}
                      disabled={followBusy[u.id]}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        u.isFollowing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600"
                          : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/25"
                      }`}
                    >
                      {u.isFollowing ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {u.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                  <Link to={`/profile/${u.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 justify-center w-full">
                    View Profile <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-12 text-center border border-white/30">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <button disabled={page <= 1} onClick={() => loadUsers(page - 1, searchQuery)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => loadUsers(page + 1, searchQuery)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Next
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 sm:p-5 mt-6">
          <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UsersIcon className="w-4 h-4" /> <span>Total Members: {users.length}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 text-yellow-500" /> <span>Active Community</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 text-green-500" /> <span>Growing Daily</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
