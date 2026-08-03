import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Calendar, Plus, X, Users, MapPin, Clock, Trash2, Edit3,
  UserCheck, UserX, Search, Sparkles, ChevronDown, ChevronUp,
  Star, Award, Flame, Rocket, Heart, Zap, Globe,
  Filter, Grid3x3, List, ChevronRight, Ticket, PartyPopper,
  Building2, BookOpen, Target, Eye, ThumbsUp, Radio
} from "lucide-react";

const TABS = [
  { id: "upcoming", label: "Upcoming", icon: Calendar, endpoint: "/event/upcoming" },
  { id: "all", label: "All Events", icon: Globe, endpoint: "/event" },
  { id: "my", label: "Created by Me", icon: Star, endpoint: "/event/my" },
  { id: "joined", label: "Joined", icon: UserCheck, endpoint: "/event/joined" },
  { id: "my-clubs", label: "My Clubs Upcoming", icon: Users, endpoint: "/event/my-clubs-upcoming" },
];

// Backend now consistently returns a single-level ApiResponse: { success, message, data }.
// This helper pulls the real payload out and lets callers check success/message honestly
// instead of assuming every 2xx response means the operation actually succeeded.
const unwrap = (res) => {
  const body = res?.data ?? {};
  const success = body.success !== false; // treat missing flag as success (defensive)
  return { success, message: body.message, data: body.data ?? body };
};

export default function Events() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", clubId: "" });
  const [editingEvent, setEditingEvent] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [attendees, setAttendees] = useState({});
  const [eventStats, setEventStats] = useState({});
  const [joinStatus, setJoinStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [liveStatus, setLiveStatus] = useState({}); // eventId -> { status: "NotStarted"|"Live"|"Ended", viewerCount }

  const normalizeLiveStatus = (status) => {
    if (status === 0 || status === "NotStarted") return "NotStarted";
    if (status === 1 || status === "Live") return "Live";
    if (status === 2 || status === "Ended") return "Ended";
    return "NotStarted";
  };

  const currentEndpoint = TABS.find((t) => t.id === tab)?.endpoint || "/event/upcoming";

  // The backend returns different DTO shapes per endpoint:
  //  - /event, /event/upcoming, /event/my, /event/search  -> EventSummaryDto   (id, title, description, totalAttendees)
  //  - /event/joined                                      -> MyJoinedEventDto (eventId, eventTitle, eventDescription)
  //  - /event/my-clubs-upcoming                            -> ClubUpcomingEventDto (eventId, clubName, totalAttendees)
  // Normalize them all to a single consistent shape the UI relies on.
  const normalizeEvent = (item) => ({
    ...item,
    id: item.id ?? item.eventId,
    title: item.title ?? item.eventTitle,
    description: item.description ?? item.eventDescription ?? "",
    eventDate: item.eventDate,
    clubId: item.clubId,
    totalAttendees: item.totalAttendees ?? 0,
    club: item.club ?? (item.clubName ? { name: item.clubName } : undefined),
  });

  const loadEvents = async (targetPage = 1, query = "") => {
    setLoading(true);
    try {
      const endpoint = query ? "/event/search" : currentEndpoint;
      const params = query ? { keyword: query, page: targetPage, pageSize: 12 } : { page: targetPage, pageSize: 12 };
      const res = await api.get(endpoint, { params });
      const { success, message, data } = unwrap(res);

      if (!success) {
        toast.error(message || "Failed to load events");
        setEvents([]);
        setTotalPages(1);
        return;
      }

      const rawItems = data.items || (Array.isArray(data) ? data : []);
      const items = rawItems.map(normalizeEvent);
      setEvents(items);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);

      items.forEach(async (ev) => {
        try {
          const statusRes = await api.get(`/event/${ev.id}/join-status`);
          const statusResult = unwrap(statusRes);
          setJoinStatus((prev) => ({ ...prev, [ev.id]: statusResult.data?.hasJoined || false }));
        } catch {
          /* ignore */
        }
        try {
          const liveRes = await api.get(`/live-events/${ev.id}/status`);
          const liveResult = unwrap(liveRes);
          setLiveStatus((prev) => ({
            ...prev,
            [ev.id]: {
              status: normalizeLiveStatus(liveResult.data?.status),
              viewerCount: liveResult.data?.currentViewerCount || 0,
            },
          }));
        } catch {
          /* ignore */
        }
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load events"));
    } finally {
      setLoading(false);
    }
  };

  const loadMyClubs = async () => {
    try {
      const res = await api.get("/club/my");
      const { data } = unwrap(res);
      const list = Array.isArray(data) ? data : [];
      setClubs(list);
      if (list.length > 0) setForm((f) => ({ ...f, clubId: list[0].clubId.toString() }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadEvents(1);
    loadMyClubs();
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadEvents(1, searchTerm.trim());
  };

  const submitEvent = async () => {
    if (!form.title.trim() || !form.eventDate || !form.clubId) {
      return toast.error("Title, date and club are required");
    }
    try {
      const payload = {
        title: form.title,
        description: form.description,
        eventDate: new Date(form.eventDate).toISOString(),
        clubId: Number(form.clubId),
      };

      const res = editingEvent
        ? await api.put(`/event/${editingEvent}`, payload)
        : await api.post("/event", payload);

      const { success, message } = unwrap(res);

      // This is the actual fix: previously we assumed a 2xx HTTP status meant
      // the event was created/updated. The backend can return 2xx with
      // success:false (e.g. "Only admin or moderator can create events."),
      // so we must check the body before celebrating.
      if (!success) {
        toast.error(message || "Failed to save event");
        return;
      }

      toast.success(message || (editingEvent ? "Event updated!" : "Event created!"));
      setForm({ title: "", description: "", eventDate: "", clubId: clubs[0]?.clubId?.toString() || "" });
      setShowCreateForm(false);
      setEditingEvent(null);
      loadEvents(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save event"));
    }
  };

  const startEdit = (ev) => {
    setEditingEvent(ev.id);
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 16) : "",
      clubId: (ev.clubId || "").toString(),
    });
    setShowCreateForm(true);
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await api.delete(`/event/${id}`);
      const { success, message } = unwrap(res);
      if (!success) {
        toast.error(message || "Failed to delete event");
        return;
      }
      toast.success(message || "Event deleted");
      loadEvents(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete event"));
    }
  };

  const joinEvent = async (id) => {
    try {
      const res = await api.post(`/event/join/${id}`);
      const { success, message } = unwrap(res);
      if (!success) {
        toast.error(message || "Failed to join event");
        return;
      }
      setJoinStatus((prev) => ({ ...prev, [id]: true }));
      toast.success(message || "Joined event!");
      loadEvents(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to join event"));
    }
  };

  const leaveEvent = async (id) => {
    try {
      const res = await api.delete(`/event/leave/${id}`);
      const { success, message } = unwrap(res);
      if (!success) {
        toast.error(message || "Failed to leave event");
        return;
      }
      setJoinStatus((prev) => ({ ...prev, [id]: false }));
      toast.success(message || "Left event");
      loadEvents(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave event"));
    }
  };

  const toggleAttendees = async (id) => {
    const isOpen = !!expanded[id];
    if (!isOpen && !attendees[id]) {
      try {
        const res = await api.get(`/event/${id}/attendees`);
        const { data } = unwrap(res);
        setAttendees((prev) => ({ ...prev, [id]: data || [] }));
      } catch (error) {
        console.error(error);
      }
      try {
        const statsRes = await api.get(`/event/${id}/stats`);
        const { data } = unwrap(statsRes);
        setEventStats((prev) => ({ ...prev, [id]: data }));
      } catch (error) {
        console.error(error);
      }
    }
    setExpanded((prev) => ({ ...prev, [id]: !isOpen }));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Header */}
        <div className="relative mb-8">
          <div className="page-hero p-6 sm:p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <span className="hero-pill mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Hackathons · Workshops · Contests
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-2">Events</h1>
                  <p className="text-white/80 text-sm mt-1">Discover and join upcoming club events</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <PartyPopper className="w-4 h-4" />
                  <span className="text-sm font-medium">{events.length} Events</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Create Button */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 glass-card rounded-2xl shadow-lg">
          <div className="flex flex-wrap gap-1 flex-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    tab === t.id 
                      ? "btn-primary"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingEvent(null); }}
            className={`btn-primary flex items-center gap-2 ${
              showCreateForm ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" : ""
            }`}
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? "Cancel" : "New Event"}
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 relative group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events by title, description, or club..."
              className="input-premium pl-12 pr-4 py-3.5"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); loadEvents(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 animate-slideDown">
            <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-4 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
                <h2 className="relative text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> {editingEvent ? "Edit Event" : "Create Event"}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                  className="input-premium"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description"
                  rows="3"
                  className="input-premium resize-none"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="input-premium"
                  />
                  <select
                    value={form.clubId}
                    onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                    className="input-premium"
                  >
                    {clubs.map((c) => (
                      <option key={c.clubId} value={c.clubId}>{c.clubName}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={submitEvent}
                  className="btn-primary w-full py-3.5 group"
                >
                  <Rocket className="w-4 h-4" />
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="glass-card rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                <Calendar className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try a different search term" : "Create your first event to get started!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="glass-card rounded-2xl shadow-lg hover:shadow-3xl hover:shadow-red-500/15 transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-gray-100/80 dark:border-gray-700/80 hover:border-red-200/50 dark:hover:border-red-800/30 animate-fadeIn"
              >
                <div className={`relative overflow-hidden p-5 ${
                  new Date(ev.eventDate) > new Date()
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : "bg-gradient-to-r from-gray-500 to-gray-600"
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg truncate">{ev.title}</h3>
                        <div className="flex items-center gap-1.5 text-white/80 text-xs mt-2">
                          <Clock className="w-3 h-3" />
                          {new Date(ev.eventDate).toLocaleString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </div>
                      </div>
                      {liveStatus[ev.id]?.status === "Live" ? (
                        <div className="flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-white">LIVE · {liveStatus[ev.id].viewerCount}</span>
                        </div>
                      ) : new Date(ev.eventDate) > new Date() ? (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span className="text-[10px] font-semibold text-white">Upcoming</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 min-h-[40px] line-clamp-2">
                    {ev.description || "No description"}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{ev.club?.name || `Club #${ev.clubId}`}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{ev.totalAttendees || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {joinStatus[ev.id] ? (
                      <button
                        onClick={() => leaveEvent(ev.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <UserX className="w-3.5 h-3.5" /> Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => joinEvent(ev.id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Join
                      </button>
                    )}
                    <button
                      onClick={() => toggleAttendees(ev.id)}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300"
                    >
                      {expanded[ev.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/events/${ev.id}/live`)}
                    className={`w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      liveStatus[ev.id]?.status === "Live"
                        ? "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/25 hover:shadow-xl hover:scale-[1.02]"
                        : "bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    {liveStatus[ev.id]?.status === "Live"
                      ? "Join Live Now"
                      : liveStatus[ev.id]?.status === "Ended"
                      ? "View Live Recap"
                      : "Live Room"}
                  </button>

                  {expanded[ev.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 max-h-48 overflow-y-auto">
                      {eventStats[ev.id] && (
                        <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3 py-2">
                          <span className="text-gray-500 dark:text-gray-400">Total attendees</span>
                          <span className="font-bold text-gray-800 dark:text-white">
                            {eventStats[ev.id].totalAttendees ?? eventStats[ev.id].total ?? 0}
                          </span>
                        </div>
                      )}
                      {(attendees[ev.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">No attendees yet. Be the first!</p>
                      ) : (
                        (attendees[ev.id] || []).map((a) => (
                          <div key={a.userId} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white text-[10px] font-bold">
                              {(a.userName || a.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <span>{a.userName || a.user?.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {tab === "my" && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => startEdit(ev)}
                        className="flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-all text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 transition-all text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => loadEvents(page - 1, searchTerm)}
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
                    onClick={() => loadEvents(pageNum, searchTerm)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? "btn-primary w-10 h-10 flex items-center justify-center"
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
              onClick={() => loadEvents(page + 1, searchTerm)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              Next
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
