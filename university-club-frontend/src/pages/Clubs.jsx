import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import {
  Edit3, Trash2, Users, Plus, X, Check, Sparkles,
  Globe, Hash, Award, TrendingUp, UserCheck, UserX, Crown,
  Search, Heart, Star, Zap, Shield, Rocket, Flame,
  Compass, MapPin, Calendar, Clock, Filter,
  ChevronRight, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * ============================================================
 *  🏛️ Clubs — Premium Clubs Discovery Page
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Browse, search, and manage clubs           │
 *  │  🔥 Features: Create, Join, Edit, Delete, Search        │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 */

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
    const gradients = [
      "from-red-500 to-rose-600",
      "from-rose-500 to-red-600",
      "from-red-600 to-rose-500",
      "from-rose-600 to-red-500",
      "from-purple-500 to-pink-600",
      "from-pink-500 to-purple-600"
    ];
    return gradients[id % gradients.length];
  };

  const getEmoji = (id) => {
    const emojis = ["🚀", "💡", "🎯", "⚡", "🌟", "🔥", "💎", "🌈"];
    return emojis[id % emojis.length];
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 pb-12 overflow-hidden">
      
      {/* Premium Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Header */}
        <div className="relative mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-10 md:p-12 text-white overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    Clubs
                  </h1>
                </div>
                <p className="text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                  Join communities that match your interests and participate in exciting activities and discussions.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">{clubs.length}+ Clubs</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10">
                    <TrendingUp className="w-4 h-4" />
                    <span>Active Community</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10">
                    <Rocket className="w-4 h-4" />
                    <span>Join Today</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-400 rounded-full ring-2 ring-white/20" />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full ring-2 ring-white/20" />
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full ring-2 ring-white/20" />
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full ring-2 ring-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Club Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              showCreateForm 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 hover:scale-105" 
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 hover:scale-105"
            }`}
          >
            {showCreateForm ? (
              <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            )}
            {showCreateForm ? "Cancel" : "Create New Club"}
            <Sparkles className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 animate-slideDown">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
              <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-4 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
                <h2 className="relative text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Create New Club
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Club Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="e.g., Tech Enthusiasts, Book Lovers Club..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what your club is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 resize-none transition-all duration-200 outline-none"
                  />
                </div>
                <button
                  onClick={createClub}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Rocket className="w-4 h-4" /> Create Club
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 relative group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search clubs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-300 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); loadClubs(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span>{clubs.length} {clubs.length === 1 ? "Club" : "Clubs"}</span>
            <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
              {searchTerm && `• Searching: "${searchTerm}"`}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-300 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-red-500/10 p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No clubs found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try a different search term" : "Be the first to create a club!"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all"
              >
                Create Club
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clubs.map((club, index) => (
              <div
                key={club.id}
                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-3xl hover:shadow-red-500/15 transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-red-200/50 dark:hover:border-red-800/30"
              >
                {editingClub === club.id ? (
                  <div className="p-5">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Club Name</label>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 resize-none outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => updateClub(club.id)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all text-sm flex-1 justify-center hover:scale-[1.02]"
                        >
                          <Check className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1.5 bg-gray-500 dark:bg-gray-600 text-white px-4 py-2.5 rounded-xl hover:bg-gray-600 dark:hover:bg-gray-500 transition-all text-sm flex-1 justify-center"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${getRandomGradient(index)} p-5 relative overflow-hidden min-h-[140px]`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                            <span className="text-3xl">{getEmoji(index)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                            <Users className="w-3 h-3 text-white/80" />
                            <span className="text-xs font-semibold text-white">{club.memberCount || 0}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-xl mt-3 truncate">{club.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Hash className="w-3 h-3 text-white/60" />
                          <span className="text-white/60 text-xs">ID: {club.id}</span>
                        </div>
                        <Link
                          to={`/clubs/${club.id}`}
                          className="inline-flex items-center gap-1 mt-2 text-sm text-white/80 hover:text-white transition-colors group/link"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed min-h-[60px] line-clamp-3">
                        {club.description || "No description provided yet."}
                      </p>

                      <div className="flex gap-2 mt-4">
                        {joinedClubs.has(club.id) ? (
                          <button
                            onClick={() => leaveClub(club.id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-2.5 rounded-xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                          >
                            <UserX className="w-3.5 h-3.5" /> Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => joinClub(club.id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2.5 rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Join
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Owner Actions */}
                    {user && club.createdBy === user.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center gap-3">
                        <button
                          onClick={() => startEditing(club)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-all text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => deleteClub(club.id)}
                          className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 transition-all text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 px-2.5 py-1 rounded-xl">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span>Owner</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => loadClubs(page - 1, searchTerm)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) return null;
                }
                return (
                  <button
                    key={i}
                    onClick={() => loadClubs(pageNum, searchTerm)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => loadClubs(page + 1, searchTerm)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              Next
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}