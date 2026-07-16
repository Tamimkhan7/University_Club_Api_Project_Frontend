import { useEffect, useState, useRef, useContext, useCallback } from "react";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Send, Search, Trash2, Edit2, Check, X, MessageSquare, ArrowLeft, Loader2,
  Users, Heart, Star, Zap, Sparkles, Clock, Shield, User, 
  CheckCheck, ChevronRight, MoreVertical, Paperclip, Smile,
  Camera, Mic, Phone, Video, UserPlus, Crown, Award
} from "lucide-react";

/**
 * ============================================================
 *  💬 Messages — Premium Messaging Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Direct messaging between users             │
 *  │  🔥 Features: CRUD, Search, Real-time polling          │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 */

export default function Messages() {
  const { user: me } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const handleMessageSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    try {
      const res = await api.get("/message/search", { params: { keyword: searchKeyword.trim(), page: 1, pageSize: 20 } });
      setSearchResults(res.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Search failed"));
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 pb-12 overflow-hidden">
      
      {/* Premium Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl blur-3xl opacity-20 animate-pulse-slow" />
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-5 text-white overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
                <p className="text-white/80 text-xs sm:text-sm">Connect with your friends and community</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                  {conversations.length} conversations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 h-[75vh] grid grid-cols-1 md:grid-cols-3">
          
          {/* Conversations List */}
          <div className={`border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto ${activeUser ? "hidden md:block" : ""}`}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 sticky top-0 z-10">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Messages
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-auto">{conversations.length}</span>
              </h2>
            </div>

            {/* Search */}
            <form onSubmit={handleMessageSearch} className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all"
                />
              </div>
            </form>

            {/* Search Results */}
            {searchResults !== null && (
              <div className="border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-between items-center px-4 py-2 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Search results
                  </span>
                  <button 
                    onClick={() => { setSearchResults(null); setSearchKeyword(""); }} 
                    className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800/30 rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-6">
                    <Search className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                    No messages found.
                  </div>
                ) : (
                  searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const otherId = m.senderId === me?.id ? m.receiverId : m.senderId;
                        const otherName = m.senderId === me?.id ? m.receiverName : m.senderName;
                        openChat({ userId: otherId, userName: otherName, profileImage: m.senderImage });
                        setSearchResults(null);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all border-b border-gray-50 dark:border-gray-700/50 group"
                    >
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-[8px] text-white font-bold">
                          {m.senderName?.charAt(0)?.toUpperCase()}
                        </span>
                        {m.senderName} <span className="text-gray-400">→</span> {m.receiverName}
                      </p>
                      <p className="text-xs text-gray-500 truncate pl-6 group-hover:text-red-500 transition-colors">{m.text}</p>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Conversations */}
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60%] text-center px-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No conversations yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Visit a profile to start messaging</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => openChat(c)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-200 border-b border-gray-50 dark:border-gray-700/50 group ${
                    activeUser?.userId === c.userId ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName)}&background=dc2626&color=fff&bold=true`}
                      alt={c.userName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all duration-300"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {c.userName}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-lg shadow-red-500/25 animate-pulse">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      {c.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </div>

          {/* Chat Panel */}
          <div className={`md:col-span-2 flex flex-col ${!activeUser ? "hidden md:flex" : ""}`}>
            {!activeUser ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Select a conversation</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Choose a chat to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
                  <button 
                    onClick={() => setActiveUser(null)} 
                    className="md:hidden text-white hover:bg-white/20 p-1.5 rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={activeUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.userName)}&background=fff&color=dc2626&bold=true`}
                    alt={activeUser.userName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <span className="font-bold text-white">{activeUser.userName}</span>
                    <p className="text-white/70 text-[10px] flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      Online
                    </p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <button className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-800/30">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Say hello to {activeUser.userName}!</p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isMine = m.senderId === me?.id;
                      const showTimestamp = index === 0 || new Date(m.createdAt) - new Date(messages[index - 1].createdAt) > 60000;
                      return (
                        <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeIn`}>
                          <div className={`max-w-[75%] ${isMine ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"} rounded-2xl px-4 py-2.5 shadow-lg ${!isMine ? "shadow-gray-200/50 dark:shadow-gray-700/30" : "shadow-red-500/20"} relative group`}>
                            
                            {editingId === m.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="text-black dark:text-white bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 text-sm border-2 border-red-300 focus:border-red-500 outline-none"
                                  autoFocus
                                />
                                <button onClick={() => saveEdit(m.id)} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded-lg transition-all">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-lg transition-all">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className={`text-[10px] ${isMine ? "text-white/60" : "text-gray-400"}`}>
                                    {formatTime(m.createdAt)}
                                    {m.isEdited ? " · edited" : ""}
                                  </span>
                                  {isMine && (
                                    <CheckCheck className={`w-3 h-3 ${isMine ? "text-white/60" : "text-gray-400"}`} />
                                  )}
                                </div>
                                {isMine && (
                                  <div className="absolute -top-2 right-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex divide-x divide-gray-200 dark:divide-gray-700 overflow-hidden">
                                    <button 
                                      onClick={() => { setEditingId(m.id); setEditText(m.text); }} 
                                      className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => deleteForEveryone(m.id)} 
                                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex gap-2">
                  <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all text-sm"
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={sending || !text.trim()} 
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2.5 rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.05] disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}