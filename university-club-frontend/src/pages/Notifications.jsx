import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Bell, Check, Trash2, CheckCheck, UserPlus, MessageSquare,
  Heart, MessageCircle, FileText, CalendarCheck, X,
} from "lucide-react";

const TYPE_META = {
  Follow: { icon: UserPlus, color: "text-blue-500 bg-blue-50" },
  Message: { icon: MessageSquare, color: "text-green-500 bg-green-50" },
  EventJoin: { icon: CalendarCheck, color: "text-purple-500 bg-purple-50" },
  Comment: { icon: MessageCircle, color: "text-amber-500 bg-amber-50" },
  Reaction: { icon: Heart, color: "text-red-500 bg-red-50" },
  NewPost: { icon: FileText, color: "text-indigo-500 bg-indigo-50" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 overflow-hidden border border-white/30 dark:border-gray-700/50">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex items-center justify-between">
            <h1 className="font-bold text-white text-xl flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </h1>
            <div className="flex gap-2">
              <button onClick={markAllAsRead} className="text-white/90 hover:text-white text-sm flex items-center gap-1">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-700">
            {["", "Follow", "Message", "EventJoin", "Comment", "Reaction", "NewPost"].map((t) => (
              <button
                key={t || "all"}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  filterType === t ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {t || "All"}
              </button>
            ))}
            <div className="flex-1" />
            {selected.size > 0 && (
              <button onClick={deleteSelected} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500 text-white">
                Delete Selected ({selected.size})
              </button>
            )}
            <button onClick={deleteAll} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-100 text-red-600">
              Delete All
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.typeLabel] || { icon: Bell, color: "text-gray-500 bg-gray-100" };
                const Icon = meta.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-4 transition ${!n.isRead ? "bg-red-50/40 dark:bg-red-900/10" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(n.id)}
                      onChange={() => toggleSelect(n.id)}
                      className="mt-2"
                    />
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                        {n.message || n.typeLabel}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    <div className="flex gap-1">
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n.id)} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Mark as read">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button disabled={page <= 1} onClick={() => load(page - 1, filterType)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 text-sm">
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => load(page + 1, filterType)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 text-sm">
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
