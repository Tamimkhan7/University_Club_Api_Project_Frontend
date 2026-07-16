import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Calendar, Plus, X, Users, MapPin, Clock, Trash2, Edit3,
  UserCheck, UserX, Search, Sparkles, ChevronDown, ChevronUp,
  Star, Award, Flame, Rocket, Heart, Zap, Globe,
  Filter, Grid3x3, List, ChevronRight, Ticket, PartyPopper
} from "lucide-react";

const TABS = [
  { id: "upcoming", label: "Upcoming", icon: Calendar },
  { id: "all", label: "All Events", icon: Globe },
  { id: "my", label: "Created by Me", icon: Star },
  { id: "joined", label: "Joined", icon: UserCheck },
  { id: "my-clubs", label: "My Clubs Upcoming", icon: Users },
];

/**
 * ============================================================
 *  🎪 Events — Premium Events Management Page
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Discover, join, and manage events           │
 *  │  🔥 Features: CRUD, Join/Leave, Attendees, Search       │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 */

export default function Events() {
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

  const currentEndpoint = TABS.find((t) => t.id === tab)?.endpoint || "/event/upcoming";

  const loadEvents = async (targetPage = 1, query = "") => {
    setLoading(true);
    try {
      const endpoint = query ? "/event/search" : currentEndpoint;
      const params = query ? { keyword: query, page: targetPage, pageSize: 12 } : { page: targetPage, pageSize: 12 };
      const res = await api.get(endpoint, { params });
      const data = res.data || {};
      const items = data.items || data || [];
      setEvents(items);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);

      items.forEach(async (ev) => {
        try {
          const statusRes = await api.get(`/event/${ev.id}/join-status`);
          setJoinStatus((prev) => ({ ...prev, [ev.id]: statusRes.data?.hasJoined || false }));
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
      setClubs(res.data || []);
      if ((res.data || []).length > 0) setForm((f) => ({ ...f, clubId: res.data[0].clubId.toString() }));
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
      if (editingEvent) {
        await api.put(`/event/${editingEvent}`, payload);
        toast.success("Event updated!");
      } else {
        await api.post("/event", payload);
        toast.success("Event created!");
      }
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
      await api.delete(`/event/${id}`);
      toast.success("Event deleted");
      loadEvents(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete event"));
    }
  };

  const joinEvent = async (id) => {
    try {
      await api.post(`/event/join/${id}`);
      setJoinStatus((prev) => ({ ...prev, [id]: true }));
      toast.success("Joined event!");
      loadEvents(page, searchTerm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to join event"));
    }
  };

  const leaveEvent = async (id) => {
    try {
      await api.delete(`/event/leave/${id}`);
      setJoinStatus((prev) => ({ ...prev, [id]: false }));
      toast.success("Left event");
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
        setAttendees((prev) => ({ ...prev, [id]: res.data || [] }));
      } catch (error) {
        console.error(error);
      }
      try {
        const statsRes = await api.get(`/event/${id}/stats`);
        setEventStats((prev) => ({ ...prev, [id]: statsRes.data }));
      } catch (error) {
        console.error(error);
      }
    }
    setExpanded((prev) => ({ ...prev, [id]: !isOpen }));
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
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Events</h1>
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
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="flex flex-wrap gap-1 flex-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    tab === t.id 
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-105" 
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              showCreateForm 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 hover:scale-105" 
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 hover:scale-105"
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
              className="w-full px-5 py-3.5 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-300 outline-none"
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
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
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
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-200 outline-none"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description"
                  rows="3"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 resize-none transition-all duration-200 outline-none"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-200 outline-none"
                  />
                  <select
                    value={form.clubId}
                    onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-200 outline-none"
                  >
                    {clubs.map((c) => (
                      <option key={c.clubId} value={c.clubId}>{c.clubName}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={submitEvent}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02]"
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
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Calendar className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try a different search term" : "Create your first event to get started!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-3xl hover:shadow-red-500/15 transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-red-200/50 dark:hover:border-red-800/30"
              >
                {/* Card Header */}
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
                      {new Date(ev.eventDate) > new Date() && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span className="text-[10px] font-semibold text-white">Upcoming</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 min-h-[40px] line-clamp-2">
                    {ev.description || "No description"}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{ev.club?.name || `Club #${ev.clubId}`}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{ev.totalAttendees || 0}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
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

                  {/* Attendees List */}
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

                  {/* Edit/Delete for Created Events */}
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
              onClick={() => loadEvents(page + 1, searchTerm)}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}