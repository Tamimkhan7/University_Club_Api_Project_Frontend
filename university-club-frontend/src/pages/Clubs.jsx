import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import {
  Edit3, Trash2, Users, Plus, X, Check, Sparkles,
  Globe, Hash, Award, TrendingUp, UserCheck, UserX, Crown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Clubs() {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingClub, setEditingClub] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState(new Set());

  const loadClubs = async (targetPage = 1, query = "") => {
    setLoading(true);
    try {
      const endpoint = query ? "/club/search" : "/club/all";
      const params = query ? { query, page: targetPage, pageSize: 12 } : { page: targetPage, pageSize: 12 };
      const res = await api.get(endpoint, { params });
      const data = res.data || {};
      setClubs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);

      const myRes = await api.get("/club/my");
      setJoinedClubs(new Set((myRes.data || []).map((c) => c.clubId)));
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to load clubs"));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClubs(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadClubs(1, searchTerm.trim());
  };

  const createClub = async () => {
    if (!name.trim()) return toast.error("Please enter club name");
    try {
      await api.post("/club/create", { name, description });
      setName("");
      setDescription("");
      setShowCreateForm(false);
      loadClubs(1, searchTerm);
      toast.success("✨ Club created successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create club"));
    }
  };

  const joinClub = async (clubId) => {
    try {
      await api.post("/club/join", { clubId });
      setJoinedClubs((prev) => new Set(prev).add(clubId));
      toast.success("🎉 Joined club successfully!");
      loadClubs(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Already joined or error occurred"));
    }
  };

  const leaveClub = async (clubId) => {
    try {
      await api.delete(`/club/leave/${clubId}`);
      const newJoined = new Set(joinedClubs);
      newJoined.delete(clubId);
      setJoinedClubs(newJoined);
      toast.success("👋 Left club successfully!");
      loadClubs(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave club"));
    }
  };

  const updateClub = async (clubId) => {
    if (!editName.trim()) return toast.error("Please enter club name");
    try {
      await api.put(`/club/update/${clubId}`, { name: editName, description: editDescription });
      setEditingClub(null);
      loadClubs(page, searchTerm);
      toast.success("✅ Club updated successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update club"));
    }
  };

  const deleteClub = async (clubId) => {
    if (!confirm("⚠️ Are you sure you want to delete this club? All posts will also be deleted!")) return;
    try {
      await api.delete(`/club/delete/${clubId}`);
      loadClubs(page, searchTerm);
      toast.success("🗑️ Club deleted successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete club"));
    }
  };

  const startEditing = (club) => {
    setEditingClub(club.id);
    setEditName(club.name);
    setEditDescription(club.description || "");
  };

  const cancelEditing = () => {
    setEditingClub(null);
    setEditName("");
    setEditDescription("");
  };

  const getRandomGradient = (id) => {
    const gradients = ["from-red-500 to-rose-600", "from-rose-500 to-red-600", "from-red-600 to-rose-500", "from-rose-600 to-red-500"];
    return gradients[id % gradients.length];
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl blur-3xl opacity-20"></div>
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold">Clubs</h1>
              </div>
              <p className="text-white/90 text-sm sm:text-base max-w-2xl">
                Join communities that match your interests and participate in exciting activities and discussions.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                  <Award className="w-4 h-4" />
                  <span>{clubs.length}+ Clubs</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              showCreateForm ? "bg-red-500 text-white hover:bg-red-600 shadow-lg" : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5"
            }`}
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? "Cancel" : "Create New Club"}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 overflow-hidden border border-white/30 dark:border-gray-700/50">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Create New Club
                </h2>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Club Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="e.g., Tech Enthusiasts, Book Lovers Club..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what your club is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none transition-all duration-200"
                  />
                </div>
                <button
                  onClick={createClub}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Create Club
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-8 relative">
          <input
            type="text"
            placeholder="🔍 Search clubs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200"
          />
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </form>

        <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            {clubs.length} {clubs.length === 1 ? "Club" : "Clubs"}
          </h2>
          {searchTerm && (
            <button onClick={() => { setSearchTerm(""); loadClubs(1); }} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <X className="w-4 h-4" /> Clear search
            </button>
          )}
        </div>

        {clubs.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 p-8 sm:p-12 text-center border border-white/30">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No clubs found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{searchTerm ? "Try a different search term" : "Be the first to create a club!"}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club, index) => (
              <div key={club.id} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/15 transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-red-200/50">
                {editingClub === club.id ? (
                  <div className="p-5">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Club Name</label>
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                        <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows="3" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 resize-none transition" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => updateClub(club.id)} className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm flex-1 justify-center">
                          <Check className="w-4 h-4" /> Save
                        </button>
                        <button onClick={cancelEditing} className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm flex-1 justify-center">
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`bg-gradient-to-r ${getRandomGradient(index)} p-4 sm:p-5 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                          <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg sm:text-xl truncate">{club.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Hash className="w-3 h-3 text-white/70" />
                          <span className="text-white/70 text-xs">ID: {club.id}</span>
                        </div>
                        <Link to={`/clubs/${club.id}`} className="inline-block mt-2 text-xs text-white/90 underline">
                          View Details →
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed min-h-[60px]">
                        {club.description || "No description provided yet."}
                      </p>

                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Users className="w-3 h-3" />
                        </div>
                        <span>{club.memberCount || 0} members</span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {joinedClubs.has(club.id) ? (
                          <button onClick={() => leaveClub(club.id)} className="flex-1 bg-red-500 text-white px-3 py-2.5 rounded-xl hover:bg-red-600 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1.5 shadow-md">
                            <UserX className="w-3.5 h-3.5" /> Leave
                          </button>
                        ) : (
                          <button onClick={() => joinClub(club.id)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" /> Join
                          </button>
                        )}
                      </div>
                    </div>

                    {user && club.createdBy === user.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex gap-3">
                        <button onClick={() => startEditing(club)} className="flex items-center gap-1 text-red-600 hover:text-red-700 transition text-xs sm:text-sm font-medium">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => deleteClub(club.id)} className="flex items-center gap-1 text-rose-600 hover:text-rose-700 transition text-xs sm:text-sm font-medium">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Crown className="w-3 h-3 text-yellow-500" /> <span>Owner</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button disabled={page <= 1} onClick={() => loadClubs(page - 1, searchTerm)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => loadClubs(page + 1, searchTerm)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
