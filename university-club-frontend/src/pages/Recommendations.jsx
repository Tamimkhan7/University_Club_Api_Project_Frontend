import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import recommendationApi from "../api/recommendation";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Sparkles, Users, Calendar, UserPlus, X, Heart, Clock,
  Compass, BellRing, Building2, RefreshCw, ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "clubs", label: "Clubs", icon: Building2 },
  { id: "events", label: "Events", icon: Calendar },
  { id: "people", label: "People", icon: Users },
];

export default function Recommendations() {
  const [tab, setTab] = useState("clubs");
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [clubsRes, eventsRes, peopleRes] = await Promise.all([
        recommendationApi.getClubs(12),
        recommendationApi.getEvents(12),
        recommendationApi.getPeople(12),
      ]);
      setClubs(clubsRes || []);
      setEvents(eventsRes || []);
      setPeople(peopleRes || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load recommendations"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const dismissClub = async (clubId) => {
    setBusyId(clubId);
    try {
      await recommendationApi.dismissClub(clubId);
      setClubs((prev) => prev.filter((c) => c.clubId !== clubId));
      toast.success("Recommendation dismissed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to dismiss recommendation"));
    } finally {
      setBusyId(null);
    }
  };

  const followPerson = async (userId) => {
    setBusyId(userId);
    try {
      await api.post(`/follow/${userId}`);
      setPeople((prev) => prev.filter((p) => p.userId !== userId));
      toast.success("Followed!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to follow"));
    } finally {
      setBusyId(null);
    }
  };

  const runSmartDigest = async () => {
    setDigestLoading(true);
    try {
      const result = await recommendationApi.runSmartDigest();
      if (result?.notificationSent) {
        toast.success("Smart digest sent — check your notifications!");
      } else {
        toast("You're all caught up — no new digest right now.", { icon: "✨" });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate smart digest"));
    } finally {
      setDigestLoading(false);
    }
  };

  if (loading) return <Loader />;

  const activeCount = tab === "clubs" ? clubs.length : tab === "events" ? events.length : people.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 space-y-6 sm:space-y-8">
        <div className="page-hero p-6 sm:p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="page-hero-icon">
                <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <span className="text-white/70 text-xs sm:text-sm font-medium flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Suggestions
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Recommended For You
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={runSmartDigest}
                disabled={digestLoading}
                className="btn-ghost-dark group disabled:opacity-60"
              >
                <BellRing className={`w-4 h-4 ${digestLoading ? "animate-pulse" : "group-hover:rotate-12"} transition-transform duration-300`} />
                {digestLoading ? "Sending..." : "Send Me a Digest"}
              </button>
              <button
                onClick={loadAll}
                className="btn-ghost-dark group"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Refresh
              </button>
            </div>
          </div>
          <p className="relative text-white/80 text-sm sm:text-base mt-4 max-w-2xl">
            Clubs, events, and people picked for you based on who you follow, your department, and what's popular right now.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 glass-card rounded-2xl shadow-lg">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = t.id === "clubs" ? clubs.length : t.id === "events" ? events.length : people.length;
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
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? "bg-white/20" : "bg-gray-200 dark:bg-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeCount === 0 && (
          <div className="glass-card rounded-3xl shadow-xl shadow-red-500/10 p-12 sm:p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                {tab === "clubs" && <Building2 className="w-12 h-12 text-red-500" />}
                {tab === "events" && <Calendar className="w-12 h-12 text-red-500" />}
                {tab === "people" && <Users className="w-12 h-12 text-red-500" />}
              </div>
              <h3>Nothing to show right now</h3>
              <p>
                {tab === "clubs" && "You've joined or dismissed all the clubs we could suggest. Check back later!"}
                {tab === "events" && "No upcoming events from your clubs or people you follow just yet."}
                {tab === "people" && "No new people to suggest — try following more clubs or classmates."}
              </p>
            </div>
          </div>
        )}

        {tab === "clubs" && clubs.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((c) => (
              <div
                key={c.clubId}
                className="group relative glass-card-hover rounded-3xl p-6 flex flex-col animate-fadeIn overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-red-500/5 to-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <button
                    onClick={() => dismissClub(c.clubId)}
                    disabled={busyId === c.clubId}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 disabled:opacity-50"
                    title="Not interested"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to={`/clubs/${c.clubId}`}
                  className="relative mt-4 font-bold text-lg text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 line-clamp-1"
                >
                  {c.clubName}
                </Link>
                <p className="relative text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 min-h-[2.5rem]">
                  {c.description || "No description available."}
                </p>

                <div className="relative flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="badge-premium !py-1">
                    <Users className="w-3 h-3" />
                    {c.memberCount} members
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    {c.reason}
                  </span>
                </div>

                <Link
                  to={`/clubs/${c.clubId}`}
                  className="relative mt-5 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] text-sm font-semibold"
                >
                  View Club
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {tab === "events" && events.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div
                key={e.eventId}
                className="group relative glass-card-hover rounded-3xl p-6 flex flex-col animate-fadeIn overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-red-500/5 to-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Calendar className="w-6 h-6 text-white" />
                </div>

                <h3 className="relative mt-4 font-bold text-lg text-gray-800 dark:text-white line-clamp-1">
                  {e.title}
                </h3>
                {e.clubName && (
                  <Link
                    to={`/clubs/${e.clubId}`}
                    className="relative text-sm text-red-600 dark:text-red-400 hover:underline mt-1 font-medium"
                  >
                    {e.clubName}
                  </Link>
                )}

                <div className="relative flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="badge-premium !py-1">
                    <Clock className="w-3 h-3" />
                    {new Date(e.eventDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    {e.reason}
                  </span>
                </div>

                <Link
                  to="/events"
                  className="relative mt-5 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] text-sm font-semibold"
                >
                  View Events
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {tab === "people" && people.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <div
                key={p.userId}
                className="group relative glass-card-hover rounded-3xl p-6 flex flex-col items-center text-center animate-fadeIn overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-red-500/5 to-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName || "U")}&background=dc2626&color=fff&bold=true`}
                    alt={p.fullName}
                    className="relative w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <Link
                  to={`/profile/${p.userId}`}
                  className="relative mt-4 font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 truncate max-w-full"
                >
                  {p.fullName}
                </Link>
                {p.department && (
                  <span className="relative text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.department}</span>
                )}

                <div className="relative flex flex-wrap justify-center items-center gap-2 mt-3 text-xs">
                  {p.mutualFollowCount > 0 && (
                    <span className="badge-premium !py-1">
                      <Heart className="w-3 h-3" />
                      {p.mutualFollowCount} mutual
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    {p.reason}
                  </span>
                </div>

                <button
                  onClick={() => followPerson(p.userId)}
                  disabled={busyId === p.userId}
                  className="relative w-full mt-5 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 text-sm font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
