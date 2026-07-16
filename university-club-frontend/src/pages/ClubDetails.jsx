import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, Search, UserCheck, UserX, Crown, Shield,
  Calendar, MessageCircle,
} from "lucide-react";

const ROLES = ["Admin", "Moderator", "Member"];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <Link to="/clubs" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 mb-4">
          <ArrowLeft className="w-5 h-5" /> Back to Clubs
        </Link>

        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{club.name}</h1>
          <p className="text-white/90 mt-2">{club.description || "No description"}</p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {club.memberCount} members</span>
            {membership?.isMember && (
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Shield className="w-3.5 h-3.5" /> You: {membership.role}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {["posts", "members", "events"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${activeTab === t ? "bg-red-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "posts" && (
          <div className="space-y-5">
            {posts.length === 0 ? (
              <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-12 text-center">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No posts in this club yet.</p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 overflow-hidden">
            <form onSubmit={handleMemberSearch} className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-2">
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members..."
                className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
              />
              <button type="submit" className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Search className="w-4 h-4" /></button>
            </form>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center gap-3 p-4">
                  <img
                    src={m.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.userName)}&background=dc2626&color=fff`}
                    alt={m.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${m.userId}`} className="font-medium text-sm text-gray-800 dark:text-white hover:text-red-600">{m.userName}</Link>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      {m.role === "Admin" && <Crown className="w-3 h-3 text-yellow-500" />} {m.role}
                    </p>
                  </div>
                  {canManage && m.userId !== me?.id && (
                    <div className="flex items-center gap-2">
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.userId, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button onClick={() => removeMember(m.userId)} className="text-red-500"><UserX className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {memberTotalPages > 1 && (
              <div className="flex justify-center items-center gap-3 p-4">
                <button disabled={memberPage <= 1} onClick={() => loadMembers(memberPage - 1, memberSearch)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40 text-sm">Previous</button>
                <span className="text-sm text-gray-500">Page {memberPage} of {memberTotalPages}</span>
                <button disabled={memberPage >= memberTotalPages} onClick={() => loadMembers(memberPage + 1, memberSearch)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40 text-sm">Next</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.length === 0 ? (
              <div className="col-span-2 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-12 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No events for this club.</p>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-gray-800 dark:text-white">{ev.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{new Date(ev.eventDate).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{ev.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
