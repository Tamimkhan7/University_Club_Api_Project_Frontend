import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, Search, UserCheck, UserX, Crown, Shield,
  Calendar, MessageCircle, Sparkles, Zap, Heart, Clock,
  MapPin, Award, Star, Globe, Hash, Link2, Plus, Filter,
  ChevronDown, ChevronRight, CheckCircle, XCircle
} from "lucide-react";

const ROLES = ["Admin", "Moderator", "Member"];

/**
 * ============================================================
 *  🏛️ ClubDetails — Premium Club Page Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Display club details with members & posts   │
 *  │  🔥 Features: Member management, Posts, Events          │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 */

export default function ClubDetails() {
  const { id } = useParams();
  const { user: me } = useContext(AuthContext);
  const [club, setClub] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberSearch, setMemberSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  const loadClub = async () => {
    setLoading(true);
    try {
      const [clubRes, membershipRes] = await Promise.all([
        api.get(`/club/${id}`),
        api.get(`/club/${id}/membership`),
      ]);
      setClub(clubRes.data);
      setMembership(membershipRes.data);
      loadMembers(1);
      loadPosts();
      loadEvents();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load club"));
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (page = 1, query = "") => {
    try {
      const endpoint = query ? `/club/${id}/members/search` : `/club/${id}/members`;
      const params = query ? { query, page, pageSize: 20 } : { page, pageSize: 20 };
      const res = await api.get(endpoint, { params });
      setMembers(res.data?.items || []);
      setMemberPage(res.data?.page || 1);
      setMemberTotalPages(res.data?.totalPages || 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load members"));
    }
  };

  const loadPosts = async () => {
    try {
      const res = await api.get(`/club/${id}/posts`, { params: { page: 1, pageSize: 20 } });
      setPosts(res.data?.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await api.get(`/event/club/${id}`, { params: { page: 1, pageSize: 20 } });
      setEvents(res.data?.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadClub();
  }, [id]);

  const handleMemberSearch = (e) => {
    e.preventDefault();
    loadMembers(1, memberSearch.trim());
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/club/${id}/role`, { userId, role });
      toast.success("Role updated");
      loadMembers(memberPage, memberSearch);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update role"));
    }
  };

  const removeMember = async (userId) => {
    if (!confirm("Remove this member from the club?")) return;
    try {
      await api.delete(`/club/${id}/members/${userId}`);
      toast.success("Member removed");
      loadMembers(memberPage, memberSearch);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove member"));
    }
  };

  const canManage = membership?.role === "Admin" || membership?.role === "Moderator";

  if (loading) return <Loader />;
  if (!club) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 pb-12 overflow-hidden">
      
      {/* Premium Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link 
          to="/clubs" 
          className="group inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-5 px-4 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:translate-x-[-4px]"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back to Clubs</span>
        </Link>

        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white mb-8 shadow-2xl shadow-red-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  {club.name}
                </h1>
              </div>
              <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed">
                {club.description || "No description provided"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{club.memberCount}</span>
                <span className="text-white/70 text-sm">members</span>
              </div>
              {membership?.isMember && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span className="font-medium text-sm">{membership.role}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          {["posts", "members", "events"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${
                activeTab === t 
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-105" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
            >
              {t === "posts" && <MessageCircle className="w-4 h-4" />}
              {t === "members" && <Users className="w-4 h-4" />}
              {t === "events" && <Calendar className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "posts" && (
          <div className="space-y-5">
            {posts.length === 0 ? (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No posts in this club yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to share something!</p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {/* Search Header */}
            <div className="bg-gradient-to-r from-red-500/5 to-rose-500/5 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <form onSubmit={handleMemberSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200 text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Members List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {members.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No members found</p>
                </div>
              ) : (
                members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-4 p-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors duration-200 group">
                    <div className="relative">
                      <img
                        src={m.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.userName)}&background=dc2626&color=fff&bold=true`}
                        alt={m.userName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all duration-300"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/profile/${m.userId}`} 
                        className="font-semibold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                      >
                        {m.userName}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs">
                        {m.role === "Admin" && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Crown className="w-3.5 h-3.5" />
                            Admin
                          </span>
                        )}
                        {m.role === "Moderator" && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <Shield className="w-3.5 h-3.5" />
                            Moderator
                          </span>
                        )}
                        {m.role === "Member" && (
                          <span className="text-gray-400 dark:text-gray-500 font-medium">
                            Member
                          </span>
                        )}
                      </div>
                    </div>
                    {canManage && m.userId !== me?.id && (
                      <div className="flex items-center gap-2">
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.userId, e.target.value)}
                          className="text-xs border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 bg-white dark:bg-gray-900 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button 
                          onClick={() => removeMember(m.userId)} 
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group/remove"
                        >
                          <UserX className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {memberTotalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <button
                  disabled={memberPage <= 1}
                  onClick={() => loadMembers(memberPage - 1, memberSearch)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Page <span className="text-gray-900 dark:text-white">{memberPage}</span> of {memberTotalPages}
                </span>
                <button
                  disabled={memberPage >= memberTotalPages}
                  onClick={() => loadMembers(memberPage + 1, memberSearch)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
                >
                  Next
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {events.length === 0 ? (
              <div className="col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No events for this club</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for updates</p>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 p-5 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(ev.eventDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {ev.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed pl-[60px]">
                      {ev.description}
                    </p>
                  )}
                  <div className="mt-3 pl-[60px] flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-rose-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">+ attending</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}