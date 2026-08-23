import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import BackgroundDecoration from "../components/BackgroundDecoration";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { AuthContext } from "../context/AuthContext";
import recruitmentApi from "../api/recruitment";
import ApplyModal from "../components/Recruitment/ApplyModal";
import {
  Edit3, Trash2, Users, Plus, X, Check, Sparkles,
  Globe, Hash, Award, TrendingUp, UserCheck, UserX, Crown,
  Search, Heart, Star, Zap, Shield, Rocket, Flame,
  Compass, MapPin, Calendar, Clock, Filter, ClipboardList,
  ChevronRight, Building2, BookOpen, Target, Lock
} from "lucide-react";
import toast from "react-hot-toast";

const APPLICATION_STATUS = { Pending: 0, Approved: 1, Rejected: 2, Withdrawn: 3 };

export default function Clubs() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState(new Set());
  const [pendingApplications, setPendingApplications] = useState({});
  const [applyTarget, setApplyTarget] = useState(null); 

  const [joinPromptClub, setJoinPromptClub] = useState(null);

  const initialLoadDone = useRef(false);
  const searchDebounceRef = useRef(null);
 const skipNextSearchEffect = useRef(false);

  const load = async (targetPage = 1, query = "") => {
    const isInitial = !initialLoadDone.current;
    if (isInitial) setLoading(true);
    else setSearching(true);

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

        try {
        const appsRes = await recruitmentApi.getMyApplications({ page: 1, pageSize: 100 });
        const pendingMap = {};
        (appsRes?.items || []).forEach((a) => {
          if (a.status === APPLICATION_STATUS.Pending) {
            pendingMap[a.clubId] = a;
          }
        });
        setPendingApplications(pendingMap);
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to load clubs"));
    }

    if (isInitial) {
      initialLoadDone.current = true;
      setLoading(false);
    } else {
      setSearching(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    if (skipNextSearchEffect.current) {
      skipNextSearchEffect.current = false;
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      load(1, searchTerm.trim());
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    load(1, searchTerm.trim());
  };

  const clearSearch = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    skipNextSearchEffect.current = true;
    setSearchTerm("");
    load(1, "");
  };

  const createClub = async () => {
    if (!name.trim()) return toast.error("Please enter club name");
    try {
      await api.post("/club/create", { name, description });
      setName("");
      setDescription("");
      setShowCreateForm(false);
      load(1, searchTerm);
      toast.success("✨ Club created successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create club"));
    }
  };


  const openApplyModal = (club) => setApplyTarget(club);


  const canViewClub = (club) =>
    joinedClubs.has(club.id) || (user && club.createdBy === user.id);

  const handleViewDetails = (club) => {
    if (canViewClub(club)) {
      navigate(`/clubs/${club.id}`);
    } else {
      setJoinPromptClub(club);
    }
  };

  const handleApplied = (createdApplication) => {
    const clubId = applyTarget?.id;
    setApplyTarget(null);
    if (clubId && createdApplication) {
      setPendingApplications((prev) => ({ ...prev, [clubId]: createdApplication }));
    }
  };

  const leaveClub = async (clubId) => {
    try {
      await api.delete(`/club/leave/${clubId}`);
      const newJoined = new Set(joinedClubs);
      newJoined.delete(clubId);
      setJoinedClubs(newJoined);
      toast.success("👋 Left club successfully!");
      load(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave club"));
    }
  };

  const updateClub = async (clubId) => {
    if (!editName.trim()) return toast.error("Please enter club name");
    try {
      await api.put(`/club/update/${clubId}`, { name: editName, description: editDescription });
      setEditingClub(null);
      load(page, searchTerm);
      toast.success("✅ Club updated successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update club"));
    }
  };

  const deleteClub = async (clubId) => {
    if (!confirm("⚠️ Are you sure you want to delete this club? All posts will also be deleted!")) return;
    try {
      await api.delete(`/club/delete/${clubId}`);
      load(page, searchTerm);
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
      "from-pink-500 to-purple-600",
      "from-orange-500 to-red-600",
      "from-indigo-500 to-purple-600"
    ];
    return gradients[id % gradients.length];
  };

  const getEmoji = (id) => {
    const emojis = ["🚀", "💡", "🎯", "⚡", "🌟", "🔥", "💎", "🌈", "🦄", "🎨", "📚", "🎮"];
    return emojis[id % emojis.length];
  };


  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <BackgroundDecoration />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div className="relative mb-8 sm:mb-12">
          <div className="page-hero p-6 sm:p-10 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <span className="hero-pill mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Find Your People
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-2">
                      Clubs
                    </h1>
                  </div>
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
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`w-10 h-10 bg-gradient-to-br ${
                      i === 1 ? "from-red-400 to-rose-400" :
                      i === 2 ? "from-blue-400 to-indigo-400" :
                      i === 3 ? "from-green-400 to-emerald-400" :
                      "from-purple-400 to-pink-400"
                    } rounded-full ring-2 ring-white/20`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`btn-primary inline-flex items-center gap-2 group ${
              showCreateForm ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" : ""
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

        {showCreateForm && (
          <div className="mb-8 animate-slideDown">
            <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden">
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
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what your club is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="input-premium resize-none"
                  />
                </div>
                <button
                  onClick={createClub}
                  className="btn-primary w-full py-3.5 group"
                >
                  <Rocket className="w-4 h-4" /> Create Club
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-8 relative group">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300 ${searching ? "animate-pulse text-red-400" : ""}`} />
            <input
              type="text"
              placeholder="Search clubs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-12 pr-4 py-3.5"
              autoFocus={false}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

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
            <button className="p-2.5 glass-card rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-red-300 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clubs found"
            message={searchTerm ? "Try a different search term" : "Be the first to create a club!"}
            cardClassName="glass-card rounded-3xl shadow-xl shadow-red-500/10 p-12 text-center"
          >
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary mt-4 px-6 py-2.5"
              >
                Create Club
              </button>
            )}
          </EmptyState>
        ) : (
          <div className={`grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-200 ${searching ? "opacity-60" : "opacity-100"}`}>
            {clubs.map((club, index) => (
              <div
                key={club.id}
                className="group relative glass-card rounded-3xl hover:shadow-2xl hover:shadow-red-500/15 transition-all duration-500 overflow-hidden hover:-translate-y-2 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                {editingClub === club.id ? (
                  <div className="p-5">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Club Name</label>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="input-premium py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows="3"
                          className="input-premium py-2 text-sm resize-none"
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
                    <div className={`relative bg-gradient-to-br ${getRandomGradient(index)} p-5 overflow-hidden min-h-[150px]`}>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
                          backgroundSize: "18px 18px",
                        }}
                      />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-300/20 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                            <span className="text-3xl">{getEmoji(index)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                            <Users className="w-3 h-3 text-white/90" />
                            <span className="text-xs font-semibold text-white">{club.memberCount || 0}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-xl mt-3 truncate">{club.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Hash className="w-3 h-3 text-white/60" />
                          <span className="text-white/60 text-xs">ID: {club.id}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewDetails(club)}
                          className="inline-flex items-center gap-1 mt-2 text-sm text-white/85 hover:text-white transition-colors group/link"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed min-h-[60px] line-clamp-3">
                        {club.description || "No description provided yet."}
                      </p>

                      <div className="flex gap-2 mt-4">
                        {joinedClubs.has(club.id) ? (
                          <button
                            onClick={() => leaveClub(club.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-[1.02]"
                          >
                            <UserX className="w-3.5 h-3.5" /> Leave
                          </button>
                        ) : pendingApplications[club.id] ? (
                          <button
                            disabled
                            title="Waiting for a club admin or moderator to review your application"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 cursor-not-allowed"
                          >
                            <Clock className="w-3.5 h-3.5" /> Pending Review
                          </button>
                        ) : (
                          <button
                            onClick={() => openApplyModal(club)}
                            className="flex-1 btn-primary !py-2.5 text-sm"
                          >
                            <ClipboardList className="w-3.5 h-3.5" /> Apply to Join
                          </button>
                        )}
                      </div>
                    </div>

                    {user && club.createdBy === user.id && (
                      <div className="border-t border-gray-100 dark:border-ink-800 px-5 py-3 bg-gray-50/60 dark:bg-ink-800/40 flex items-center gap-3">
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
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/30">
                          <Crown className="w-3 h-3" />
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

        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => load(p, searchTerm)} />
      </div>

      {applyTarget && (
        <ApplyModal
          clubId={applyTarget.id}
          clubName={applyTarget.name}
          onClose={() => setApplyTarget(null)}
          onApplied={handleApplied}
        />
      )}

   
      {joinPromptClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-5 relative">
              <button
                onClick={() => setJoinPromptClub(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Join to view this club</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You need to be a member of <span className="font-semibold text-gray-800 dark:text-white">{joinPromptClub.name}</span> to
                view its details, posts, and members. Apply to join to get access.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setJoinPromptClub(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const club = joinPromptClub;
                    setJoinPromptClub(null);
                    if (pendingApplications[club.id]) {
                      toast("Your application is already pending review.");
                      return;
                    }
                    openApplyModal(club);
                  }}
                  className="flex-1 btn-primary !py-2.5 text-sm"
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Apply to Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}