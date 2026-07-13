import { useEffect, useState, useRef, useContext, useCallback } from "react";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Send, Search, Trash2, Edit2, Check, X, MessageSquare, ArrowLeft, Loader2,
} from "lucide-react";

export default function Messages() {
  const { user: me } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeUser, setActiveUser] = useState(null); // { userId, userName, profileImage }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const loadConversations = async () => {
    try {
      const res = await api.get("/message/conversations");
      setConversations(res.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load conversations"));
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadChat = useCallback(async (userId) => {
    try {
      const res = await api.get(`/message/${userId}`, { params: { page: 1, pageSize: 50, sortOrder: "asc" } });
      setMessages(res.data?.items || []);
      api.put(`/message/seen/${userId}`).catch(() => {});
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load chat"));
    }
  }, []);

  const openChat = (conv) => {
    setActiveUser(conv);
    loadChat(conv.userId);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadChat(conv.userId), 4000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !activeUser) return;
    setSending(true);
    try {
      await api.post("/message", { receiverId: activeUser.userId, text: text.trim() });
      setText("");
      loadChat(activeUser.userId);
      loadConversations();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/message/${id}`, { text: editText.trim() });
      setEditingId(null);
      loadChat(activeUser.userId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to edit message"));
    }
  };

  const deleteForEveryone = async (id) => {
    if (!confirm("Delete this message for everyone?")) return;
    try {
      await api.delete(`/message/${id}/for-everyone`);
      loadChat(activeUser.userId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete message"));
    }
  };

  const deleteForMe = async (id) => {
    try {
      await api.delete(`/message/${id}/for-me`);
      loadChat(activeUser.userId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete message"));
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loadingConvos) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 overflow-hidden border border-white/30 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-3 h-[75vh]">
          {/* Conversations list */}
          <div className={`border-r border-gray-100 dark:border-gray-700 overflow-y-auto ${activeUser ? "hidden md:block" : ""}`}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Messages
              </h2>
            </div>
            {conversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No conversations yet. Visit a profile to start one.</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => openChat(c)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition border-b border-gray-50 dark:border-gray-700/50 ${
                    activeUser?.userId === c.userId ? "bg-red-50 dark:bg-red-900/20" : ""
                  }`}
                >
                  <img
                    src={c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName)}&background=dc2626&color=fff`}
                    alt={c.userName}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">{c.userName}</span>
                      {c.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{c.unreadCount}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat panel */}
          <div className={`md:col-span-2 flex flex-col ${!activeUser ? "hidden md:flex" : ""}`}>
            {!activeUser ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                  <p>Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3">
                  <button onClick={() => setActiveUser(null)} className="md:hidden text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={activeUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.userName)}&background=fff&color=dc2626`}
                    alt={activeUser.userName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="font-bold text-white">{activeUser.userName}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const isMine = m.senderId === me?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] group relative ${isMine ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"} rounded-2xl px-4 py-2`}>
                          {editingId === m.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="text-black rounded px-2 py-1 text-sm"
                              />
                              <button onClick={() => saveEdit(m.id)}><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingId(null)}><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className={`text-[10px] ${isMine ? "text-white/70" : "text-gray-400"}`}>
                                  {formatTime(m.createdAt)}{m.isEdited ? " · edited" : ""}
                                </span>
                              </div>
                              {isMine && (
                                <div className="hidden group-hover:flex gap-1 absolute -top-3 right-0 bg-white dark:bg-gray-800 rounded-lg shadow px-1">
                                  <button onClick={() => { setEditingId(m.id); setEditText(m.text); }} className="p-1 text-gray-500 hover:text-red-500">
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => deleteForEveryone(m.id)} className="p-1 text-gray-500 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !text.trim()}
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
