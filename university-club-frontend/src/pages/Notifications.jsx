import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Bell, Check, Trash2, CheckCheck, UserPlus, MessageSquare,
  Heart, MessageCircle, FileText, CalendarCheck, X,
  Sparkles, Zap, Star, Award, Crown, Gift, Rocket,
  Clock, Filter, MoreVertical, Shield, Users,
  ChevronDown, ChevronUp, Circle, CircleCheck, CircleDot,
  ClipboardList, CheckCircle2, XCircle, Mail
} from "lucide-react";

const TYPE_META = {
  Follow: { icon: UserPlus, color: "text-blue-500 bg-blue-50", emoji: "👋" },
  Message: { icon: MessageSquare, color: "text-green-500 bg-green-50", emoji: "💬" },
  EventJoin: { icon: CalendarCheck, color: "text-purple-500 bg-purple-50", emoji: "📅" },
  Comment: { icon: MessageCircle, color: "text-amber-500 bg-amber-50", emoji: "💭" },
  Reaction: { icon: Heart, color: "text-red-500 bg-red-50", emoji: "❤️" },
  NewPost: { icon: FileText, color: "text-indigo-500 bg-indigo-50", emoji: "📝" },
  NewApplication: { icon: ClipboardList, color: "text-amber-500 bg-amber-50", emoji: "📋" },
  ApplicationApproved: { icon: CheckCircle2, color: "text-green-500 bg-green-50", emoji: "🎉" },
  ApplicationRejected: { icon: XCircle, color: "text-red-500 bg-red-50", emoji: "😔" },
  ClubInvite: { icon: Mail, color: "text-rose-500 bg-rose-50", emoji: "✉️" },
};

// Notification types that should route the user to a specific page when tapped.
const TYPE_LINKS = {
  ClubInvite: "/invites",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState(new Set());

  const load = async (targetPage = 1, type = "") => {
    setLoading(true);
    try {
      const res = await api.get("/notification", { params: { type: type || undefined, page: targetPage, pageSize: 15 } });
      const data = res.data || {};
      setNotifications(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, filterType);
  }, [filterType]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notification/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notification/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    try {
      await api.delete("/notification/delete-selected", { data: { notificationIds: [...selected] } });
      setNotifications((prev) => prev.filter((n) => !selected.has(n.id)));
      setSelected(new Set());
      toast.success("Deleted selected notifications");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteAll = async () => {
    if (!confirm("Delete ALL notifications?")) return;
    try {
      await api.delete("/notification/delete-all");
      setNotifications([]);
      toast.success("All notifications deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (date) => {
    const diffMs = new Date() - new Date(date);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getUnreadCount = () => notifications.filter(n => !n.isRead).length;

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Header */}
        <div className="relative mb-6">
          <div className="page-hero rounded-2xl p-5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
                <p className="text-white/80 text-xs sm:text-sm">Stay updated with what's happening</p>
              </div>
              {getUnreadCount() > 0 && (
                <div className="ml-auto bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                  {getUnreadCount()} unread
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/15">
          
          {/* Header Actions */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            <div className="relative flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-bold text-white">Inbox</h2>
            </div>
            <button 
              onClick={markAllAsRead} 
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-sm font-medium text-white"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>
              {["", "Follow", "Message", "EventJoin", "Comment", "Reaction", "NewPost", "NewApplication", "ApplicationApproved", "ApplicationRejected", "ClubInvite"].map((t) => (
                <button
                  key={t || "all"}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    filterType === t 
                      ? "btn-primary py-1.5 px-3"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {t || "All"}
                </button>
              ))}
              <div className="flex-1" />
              {selected.size > 0 && (
                <button 
                  onClick={deleteSelected} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 transition-all duration-300 hover:scale-105"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})
                </button>
              )}
              <button 
                onClick={deleteAll} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> All
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="empty-state py-16">
                <div className="relative">
                  <div className="icon w-24 h-24">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">All caught up!</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No notifications to show</p>
              </div>
            ) : (
              notifications.map((n, index) => {
                const meta = TYPE_META[n.typeLabel] || { icon: Bell, color: "text-gray-500 bg-gray-100", emoji: "🔔" };
                const Icon = meta.icon;
                const isUnread = !n.isRead;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 group ${
                      isUnread ? "bg-red-50/40 dark:bg-red-900/10 border-l-4 border-l-red-500" : ""
                    } animate-fadeIn`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative pt-1">
                      <input
                        type="checkbox"
                        checked={selected.has(n.id)}
                        onChange={() => toggleSelect(n.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-500 focus:ring-red-400 transition-all cursor-pointer"
                      />
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110 ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        {TYPE_LINKS[n.typeLabel] ? (
                          <Link
                            to={TYPE_LINKS[n.typeLabel]}
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className={`text-sm hover:text-red-600 dark:hover:text-red-400 ${isUnread ? "font-semibold text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"} leading-relaxed`}
                          >
                            <span className="mr-1">{meta.emoji}</span>
                            {n.message || n.typeLabel}
                          </Link>
                        ) : (
                          <p className={`text-sm ${isUnread ? "font-semibold text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"} leading-relaxed`}>
                            <span className="mr-1">{meta.emoji}</span>
                            {n.message || n.typeLabel}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(n.createdAt)}
                        </span>
                        {isUnread && (
                          <span className="text-[10px] font-medium text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n.id)} 
                          className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-3 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1, filterType)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
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
                      onClick={() => load(pageNum, filterType)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                        page === pageNum
                          ? "btn-primary w-9 h-9 flex items-center justify-center"
                          : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => load(page + 1, filterType)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
              >
                Next
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          )}

          {/* Footer Stats */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
              <span>{notifications.length} notifications</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Secured
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}