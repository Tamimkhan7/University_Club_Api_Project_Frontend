import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Calendar, Plus, X, Users, MapPin, Clock, Trash2, Edit3,
  UserCheck, UserX, Search, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";

const TABS = [
  { id: "upcoming", label: "Upcoming", endpoint: "/event/upcoming" },
  { id: "all", label: "All Events", endpoint: "/event" },
  { id: "my", label: "Created by Me", endpoint: "/event/my" },
  { id: "joined", label: "Joined", endpoint: "/event/joined" },
];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }
    setExpanded((prev) => ({ ...prev, [id]: !isOpen }));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-2xl sm:text-4xl font-bold">Events</h1>
          </div>
          <p className="text-white/90 text-sm sm:text-base">Discover and join upcoming club events.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === t.id ? "bg-red-500 text-white shadow-md" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingEvent(null); }}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? "Cancel" : "New Event"}
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 relative">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            className="w-full px-5 py-3 pl-12 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </form>

        {showCreateForm && (
          <div className="mb-8 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event title"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 resize-none"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900"
                />
                <select
                  value={form.clubId}
                  onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900"
                >
                  {clubs.map((c) => (
                    <option key={c.clubId} value={c.clubId}>{c.clubName}</option>
                  ))}
                </select>
              </div>
              <button onClick={submitEvent} className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold">
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-12 text-center border border-white/30">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No events found.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                  <h3 className="font-bold text-white text-lg truncate">{ev.title}</h3>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ev.eventDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 min-h-[40px]">{ev.description || "No description"}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                    <MapPin className="w-3 h-3" /> {ev.club?.name || `Club #${ev.clubId}`}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <Users className="w-3 h-3" /> {ev.totalAttendees || 0} attendees
                  </div>

                  <div className="flex gap-2 mt-4">
                    {joinStatus[ev.id] ? (
                      <button onClick={() => leaveEvent(ev.id)} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
                        <UserX className="w-3.5 h-3.5" /> Leave
                      </button>
                    ) : (
                      <button onClick={() => joinEvent(ev.id)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Join
                      </button>
                    )}
                    <button onClick={() => toggleAttendees(ev.id)} className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {expanded[ev.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expanded[ev.id] && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1 max-h-40 overflow-y-auto">
                      {(attendees[ev.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-400">No attendees yet.</p>
                      ) : (
                        (attendees[ev.id] || []).map((a) => (
                          <div key={a.userId} className="text-xs text-gray-600 dark:text-gray-300 flex justify-between">
                            <span>{a.userName || a.user?.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {tab === "my" && (
                    <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => startEdit(ev)} className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => deleteEvent(ev.id)} className="flex items-center gap-1 text-rose-600 text-xs font-medium">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button disabled={page <= 1} onClick={() => loadEvents(page - 1, searchTerm)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => loadEvents(page + 1, searchTerm)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
