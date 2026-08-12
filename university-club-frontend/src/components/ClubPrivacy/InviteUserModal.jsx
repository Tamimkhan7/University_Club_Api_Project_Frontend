import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axios";
import clubPrivacyApi from "../../api/clubPrivacy";
import { X, Search, UserPlus, Send, Loader2, Sparkles } from "lucide-react";

export default function InviteUserModal({ clubId, clubName, onClose, onInvited }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const debounceRef = useRef(null);

  const loadUsers = async (q) => {
    setLoading(true);
    try {
      const endpoint = q ? "/user/search" : "/user/all";
      const res = await api.get(endpoint, { params: { query: q, page: 1, pageSize: 20 } });
      setUsers(res.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers("");
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadUsers(val.trim()), 300);
  };

  const handleInvite = async (targetUser) => {
    setInvitingId(targetUser.id);
    try {
      const invite = await clubPrivacyApi.createInvite(clubId, targetUser.id);
      toast.success(`Invite sent to ${targetUser.name}!`);
      onInvited?.(invite);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send invite"));
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={() => onClose?.()}
      />

      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col glass-card rounded-3xl shadow-2xl p-6 sm:p-7 animate-scaleIn">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">Invite a User</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[240px]">
                {clubName || "This club"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search users by name or email..."
            autoFocus
            className="input-premium pl-10 pr-4 py-2.5 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
              No users found
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-red-200 dark:hover:border-red-800/40 hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-all duration-200"
              >
                <img
                  src={
                    u.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&bold=true`
                  }
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                </div>
                <button
                  onClick={() => handleInvite(u)}
                  disabled={invitingId === u.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
                >
                  {invitingId === u.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Invite
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <Sparkles className="w-3.5 h-3.5" />
          Already-blocked or already-member users will be rejected automatically.
        </div>
      </div>
    </div>
  );
}
