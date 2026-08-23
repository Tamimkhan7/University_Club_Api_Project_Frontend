import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { usePresence } from "../context/PresenceContext";
import Loader from "../components/Loader";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import { isClubManager } from "../utils/textUtils";
import PostCard from "../components/PostCard";
import PollsSection from "../components/Poll/PollsSection";
import RecruitmentSection from "../components/Recruitment/RecruitmentSection";
import PrivacySection from "../components/ClubPrivacy/PrivacySection";
import { ClubVisibility, ClubVisibilityLabels } from "../api/clubPrivacy";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, Search, UserCheck, UserX, Crown, Shield,
  Calendar, MessageCircle, Sparkles, Zap, Heart, Clock,
  MapPin, Award, Star, Globe, Hash, Link2, Plus, Filter,
  ChevronDown, ChevronRight, CheckCircle, XCircle, Lock, Mail,
  Building2, BookOpen, Target, Eye, ThumbsUp, BarChart3, ClipboardList, Radio, ShieldCheck
} from "lucide-react";

const ROLES = ["Admin", "Moderator", "Member"];

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useContext(AuthContext);
  const [club, setClub] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberSearch, setMemberSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [liveStatus, setLiveStatus] = useState({}); 
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  
  const [accessDenied, setAccessDenied] = useState(false);


  const presence = usePresence(members.map((m) => m.userId));

  const loadClub = async () => {
    setLoading(true);
    setAccessDenied(false);
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
      if (error?.response?.status === 401) {
        setAccessDenied(true);
      } else {
        toast.error(getErrorMessage(error, "Failed to load club"));
      }
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

  const normalizeLiveStatus = (status) => {
    if (status === 0 || status === "NotStarted") return "NotStarted";
    if (status === 1 || status === "Live") return "Live";
    if (status === 2 || status === "Ended") return "Ended";
    return "NotStarted";
  };

  const loadEvents = async () => {
    try {
      const res = await api.get(`/event/club/${id}`, { params: { page: 1, pageSize: 20 } });
      const items = res.data?.items || [];
      setEvents(items);
      items.forEach(async (ev) => {
        try {
          const liveRes = await api.get(`/live-events/${ev.id}/status`);
          const body = liveRes.data?.success === false ? null : (liveRes.data?.data ?? liveRes.data);
          if (body) {
            setLiveStatus((prev) => ({
              ...prev,
              [ev.id]: { status: normalizeLiveStatus(body.status), viewerCount: body.currentViewerCount || 0 },
            }));
          }
        } catch {
        }
      });
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

  const leaveClub = async () => {
    if (!confirm("Leave this club?")) return;
    try {
      await api.delete(`/club/${id}/leave`);
      toast.success("Left club");
      navigate("/clubs");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave club"));
    }
  };

  const canManage = isClubManager(membership);

  const visibilityMeta = {
    [ClubVisibility.Public]: { icon: Globe, classes: "" },
    [ClubVisibility.Private]: { icon: Lock, classes: "" },
    [ClubVisibility.InviteOnly]: { icon: Mail, classes: "" },
  };
  const currentVisibility = club?.visibility ?? ClubVisibility.Public;
  const VisibilityIcon = visibilityMeta[currentVisibility]?.icon || Globe;

  const tabs = ["posts", "members", "events", "polls", "recruitment", ...(canManage ? ["privacy"] : [])];

  if (loading) return <Loader />;

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-center">
          <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-8">
            <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Join to view this club</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You need to be an approved member of this club to see its posts, members, and events.
            </p>
            <button
              onClick={() => navigate("/clubs")}
              className="btn-primary w-full !py-2.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Clubs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!club) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <BackgroundDecoration />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        <Link 
          to="/clubs" 
          className="group inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-5 px-4 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:translate-x-[-4px]"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back to Clubs</span>
        </Link>

        <div className="page-hero p-6 sm:p-8 md:p-10 mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <span className="hero-pill mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Official Club Page
              </span>
              <div className="flex items-center gap-3 mb-3 mt-2">
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
              {currentVisibility !== ClubVisibility.Public && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                  <VisibilityIcon className="w-4 h-4 text-amber-300" />
                  <span className="font-medium text-sm">{ClubVisibilityLabels[currentVisibility]}</span>
                </div>
              )}
              {membership?.isMember && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span className="font-medium text-sm">{membership.role}</span>
                </div>
              )}
              {membership?.isMember && (
                <button
                  onClick={leaveClub}
                  className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-red-500/20 text-white text-sm font-medium transition-all duration-300"
                >
                  Leave Club
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1.5 glass-card rounded-2xl shadow-lg">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === t 
                  ? "btn-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
            >
              {t === "posts" && <MessageCircle className="w-4 h-4" />}
              {t === "members" && <Users className="w-4 h-4" />}
              {t === "events" && <Calendar className="w-4 h-4" />}
              {t === "polls" && <BarChart3 className="w-4 h-4" />}
              {t === "recruitment" && <ClipboardList className="w-4 h-4" />}
              {t === "privacy" && <ShieldCheck className="w-4 h-4" />}
              <span className="capitalize">{t === "recruitment" ? "Recruitment" : t === "privacy" ? "Privacy" : t}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "posts" && (
          <div className="space-y-5">
            {posts.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                iconClassName="w-12 h-12 text-gray-400"
                title="No posts in this club yet"
                message="Be the first to share something!"
                cardClassName="glass-card rounded-3xl shadow-xl p-16 text-center"
              />
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="glass-card rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500/5 to-rose-500/5 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <form onSubmit={handleMemberSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members..."
                    className="input-premium pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary px-5 py-2.5"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {members.length === 0 ? (
                <div className="empty-state py-12">
                  <div className="icon w-16 h-16">
                    <Users className="w-8 h-8 text-gray-400" />
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
                      {presence[m.userId]?.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                      )}
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
              <EmptyState
                icon={Calendar}
                iconClassName="w-12 h-12 text-gray-400"
                title="No events for this club"
                message="Check back later for updates"
                cardClassName="col-span-2 glass-card rounded-3xl shadow-xl p-16 text-center"
              />
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="glass-card rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 p-5 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30 group">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 truncate">
                          {ev.title}
                        </h4>
                        {liveStatus[ev.id]?.status === "Live" && (
                          <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                          </span>
                        )}
                      </div>
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
                  <div className="mt-3 pl-[60px] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map((i) => (
                          <div key={i} className={`w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 ${
                            i === 1 ? "bg-gradient-to-br from-red-500 to-rose-500" :
                            i === 2 ? "bg-gradient-to-br from-blue-500 to-indigo-500" :
                            "bg-gradient-to-br from-green-500 to-emerald-500"
                          }`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">+ attending</span>
                    </div>
                    <button
                      onClick={() => navigate(`/events/${ev.id}/live`)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex-shrink-0 ${
                        liveStatus[ev.id]?.status === "Live"
                          ? "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-600/25 hover:scale-105"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      {liveStatus[ev.id]?.status === "Live" ? "Join Live" : "Live Room"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "polls" && (
          <PollsSection clubId={id} currentUserId={me?.id} membership={membership} />
        )}

        {activeTab === "recruitment" && (
          <RecruitmentSection clubId={id} club={club} membership={membership} />
        )}

        {activeTab === "privacy" && canManage && (
          <PrivacySection
            clubId={id}
            club={club}
            membership={membership}
            onClubUpdated={(updated) => setClub((prev) => ({ ...prev, ...updated }))}
          />
        )}
      </div>
    </div>
  );
}