import { useEffect, useState, useRef, useContext, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import storyApi from "../api/story";
import EmptyState from "../components/EmptyState";
import voiceMessageApi, { resolveMediaUrl, MessageMediaType } from "../api/voiceMessage";
import BackgroundDecoration from "../components/BackgroundDecoration";
import useVoiceRecorder from "../hooks/useVoiceRecorder";
import VoiceRecorderBar from "../components/VoiceRecorderBar";
import VoiceMessageBubble from "../components/VoiceMessageBubble";
import StoryViewerModal from "../components/Story/StoryViewerModal";
import { AuthContext } from "../context/AuthContext";
import { formatClockTime as formatTime } from "../utils/dateUtils";
import { usePresence, formatLastSeen } from "../context/PresenceContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Send, Search, Trash2, Edit2, Check, X, MessageSquare, ArrowLeft, Loader2,
  Users, Heart, Star, Zap, Sparkles, Clock, Shield, User, 
  CheckCheck, ChevronRight, MoreVertical, Paperclip, Smile,
  Camera, Mic, Phone, Video, UserPlus, Crown, Award,
  Circle, CircleCheck, CircleDot, CircleSlash, Mail,
  UserCircle, Plus, Hash, Building2, BookOpen, Target
} from "lucide-react";

export default function Messages() {
  const { user: me } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); 
  const pollRef = useRef(null);


  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState(null); 
  const [peopleResults, setPeopleResults] = useState([]); 
  const [searchingSidebar, setSearchingSidebar] = useState(false);
  const sidebarSearchReqIdRef = useRef(0);

  const [users, setUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const userSearchReqIdRef = useRef(0);

  const [sendingVoice, setSendingVoice] = useState(false);

  const [storyMap, setStoryMap] = useState({});
  const [storyViewerUser, setStoryViewerUser] = useState(null); 

  const presence = usePresence([
    ...conversations.map((c) => c.userId),
    ...userSearchResults.map((u) => u.id),
    ...peopleResults.map((u) => u.id),
    ...(activeUser?.userId ? [activeUser.userId] : []),
  ]);

  const loadStoriesFor = useCallback((userIds) => {
    const idsToFetch = [...new Set(userIds)].filter((id) => id != null);
    idsToFetch.forEach(async (uid) => {
      try {
        const res = await storyApi.getUserStories(uid);
        setStoryMap((prev) => {
          if (res && res.length > 0) return { ...prev, [uid]: res };
          if (prev[uid]) {
            const { [uid]: _drop, ...rest } = prev;
            return rest;
          }
          return prev;
        });
      } catch {
      }
    });
  }, []);

  const storyAttemptedRef = useRef(new Set());

  const loadUsers = async (query = "") => {
    const reqId = ++userSearchReqIdRef.current;
    setIsSearchingUsers(true);
    try {
      const res = await api.get("/user/search", { 
        params: { query: query.trim() || "", page: 1, pageSize: 20 } 
      });
      if (reqId === userSearchReqIdRef.current) {
        setUserSearchResults(res.data?.items || []);
      }
    } catch (error) {
      if (reqId === userSearchReqIdRef.current) {
        toast.error(getErrorMessage(error, "Failed to search users"));
      }
    } finally {
      if (reqId === userSearchReqIdRef.current) {
        setIsSearchingUsers(false);
      }
    }
  };

  useEffect(() => {
    if (!showUserSearch) return;
    const query = userSearchQuery.trim();
    const handle = setTimeout(() => {
      loadUsers(query);
    }, query ? 300 : 0);
    return () => clearTimeout(handle);
  }, [userSearchQuery, showUserSearch]);

  const handleUserSearch = (e) => {
    e.preventDefault();
    loadUsers(userSearchQuery);
  };

  const startNewConversation = async (userId) => {
    try {
      const existing = conversations.find(c => c.userId === userId);
      if (existing) {
        openChat(existing);
        setShowUserSearch(false);
        return;
      }
      
      const res = await api.get(`/user/profile/${userId}`);
      const userData = res.data;
      const newConv = {
        userId: userData.id,
        userName: userData.name,
        profileImage: userData.profileImage,
        lastMessage: "Start a conversation",
        unreadCount: 0
      };
      
      setConversations(prev => [newConv, ...prev]);
      openChat(newConv);
      setShowUserSearch(false);
      setUserSearchQuery("");
      setUserSearchResults([]);
      toast.success(`Started conversation with ${userData.name}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to start conversation"));
    }
  };

  useEffect(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) {
      setSearchResults(null);
      setPeopleResults([]);
      setSearchingSidebar(false);
      return;
    }
    const reqId = ++sidebarSearchReqIdRef.current;
    setSearchingSidebar(true);
    const handle = setTimeout(async () => {
      const [msgRes, userRes] = await Promise.allSettled([
        api.get("/message/search", { params: { keyword, page: 1, pageSize: 20 } }),
        api.get("/user/search", { params: { query: keyword, page: 1, pageSize: 20 } }),
      ]);
      if (reqId !== sidebarSearchReqIdRef.current) return; // stale response, ignore
      if (msgRes.status === "fulfilled") {
        setSearchResults(msgRes.value.data?.items || []);
      }
      if (userRes.status === "fulfilled") {
        setPeopleResults(userRes.value.data?.items || []);
      }
      setSearchingSidebar(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchKeyword]);

  const clearSidebarSearch = () => {
    setSearchKeyword("");
    setSearchResults(null);
    setPeopleResults([]);
  };

  const handleSelectPerson = (u) => {
    startNewConversation(u.id);
    clearSidebarSearch();
  };


  const filteredConversations = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return conversations;
    return conversations.filter((c) => c.userName?.toLowerCase().includes(keyword));
  }, [conversations, searchKeyword]);


  const newPeopleResults = useMemo(() => {
    const conversationUserIds = new Set(conversations.map((c) => c.userId));
    return peopleResults.filter((u) => !conversationUserIds.has(u.id) && u.id !== me?.id);
  }, [peopleResults, conversations, me]);

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


  useEffect(() => {
    const ids = conversations.map((c) => c.userId).filter(Boolean);
    const newIds = ids.filter((id) => !storyAttemptedRef.current.has(id));
    newIds.forEach((id) => storyAttemptedRef.current.add(id));
    if (newIds.length > 0) loadStoriesFor(newIds);
  }, [conversations, loadStoriesFor]);

  useEffect(() => {
    const refresh = setInterval(() => {
      const ids = conversations.map((c) => c.userId).filter(Boolean);
      if (ids.length > 0) loadStoriesFor(ids);
    }, 60000);
    return () => clearInterval(refresh);
  }, [conversations, loadStoriesFor]);

  const loadChat = useCallback(async (userId) => {
    try {
      const res = await api.get(`/message/${userId}`, { 
        params: { page: 1, pageSize: 50, sortOrder: "asc" } 
      });
      setMessages(res.data?.items || []);
      api.put(`/message/seen/${userId}`).catch(() => {});
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load chat"));
    }
  }, []);

  const openChat = (conv) => {
    if (isRecording) cancelRecording();
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
    const target = location.state?.startChatWith;
    if (!target || loadingConvos) return;

    const existing = conversations.find((c) => c.userId === target.userId);
    if (existing) {
      openChat(existing);
    } else {
      const newConv = {
        userId: target.userId,
        userName: target.userName,
        profileImage: target.profileImage,
        lastMessage: "Start a conversation",
        unreadCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      openChat(newConv);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, loadingConvos, conversations]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !activeUser) return;
    setSending(true);
    try {
      await api.post("/message", { 
        receiverId: activeUser.userId, 
        text: text.trim() 
      });
      setText("");
      loadChat(activeUser.userId);
      loadConversations();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const sendVoiceBlob = async (blob, durationSeconds, extension) => {
    if (!activeUser || !blob || blob.size === 0) return;
    setSendingVoice(true);
    try {
      await voiceMessageApi.sendDirect(activeUser.userId, blob, durationSeconds, `voice-message.${extension}`);
      loadChat(activeUser.userId);
      loadConversations();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send voice message"));
    } finally {
      setSendingVoice(false);
    }
  };

  const {
    isRecording,
    seconds: recordingSeconds,
    error: recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onAutoStop: (blob, extension) => sendVoiceBlob(blob, 600, extension),
  });

  useEffect(() => {
    if (recordingError) toast.error(recordingError);
  }, [recordingError]);

  const handleMicClick = () => {
    if (!activeUser) return;
    startRecording();
  };

  const handleCancelRecording = () => cancelRecording();

  const handleSendRecording = async () => {
    const result = await stopRecording();
    if (!result) return;
    await sendVoiceBlob(result.blob, result.durationSeconds, result.extension);
  };

  const deleteVoiceMessage = async (id) => {
    if (!confirm("Delete this voice message for everyone?")) return;
    try {
      await voiceMessageApi.deleteDirect(id);
      loadChat(activeUser.userId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete voice message"));
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

  // formatTime এখন src/utils/dateUtils.js থেকে আসছে (formatClockTime)

  if (loadingConvos) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <BackgroundDecoration />

      <div className="relative max-w-6xl mx-auto px-4 py-6 sm:py-8">
        
        <div className="relative mb-6">
          <div className="page-hero rounded-2xl p-5">
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
                <button
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium hover:bg-white/30 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  New Message
                </button>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                  {conversations.length} conversations
                </div>
              </div>
            </div>
          </div>
        </div>

        {showUserSearch && (
          <div className="mb-6 animate-slideDown">
            <div className="glass-card rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Start a new conversation</span>
                <button
                  onClick={() => {
                    setShowUserSearch(false);
                    setUserSearchQuery("");
                    setUserSearchResults([]);
                  }}
                  className="ml-auto p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleUserSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="input-premium pl-10 pr-4 py-2.5 text-sm"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary px-4 py-2.5 text-sm">
                  {isSearchingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>

              {userSearchResults.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
                  {userSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startNewConversation(u.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 rounded-xl transition-all duration-200 group"
                    >
                      <div className="relative">
                        <img
                          src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&bold=true`}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all"
                        />
                        {presence[u.id]?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {u.name}
                        </p>
                        {u.department && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {u.department}
                          </p>
                        )}
                      </div>
                      <Send className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {isSearchingUsers && userSearchResults.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                </div>
              )}

              {userSearchResults.length === 0 && !isSearchingUsers && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{userSearchQuery.trim() ? "No users found" : "No users to show"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden h-[75vh] grid grid-cols-1 md:grid-cols-3">
          
          <div className={`border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto ${activeUser ? "hidden md:block" : ""}`}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 sticky top-0 z-10 flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Messages
              </h2>
              <button
                onClick={() => setShowUserSearch(true)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-all"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search people or messages..."
                  className="input-premium pl-9 pr-8 py-2 text-sm"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={clearSidebarSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

                        {searchKeyword.trim() && (
              <div className="border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-between items-center px-4 py-2 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
                  <span className="text-xs font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    People
                  </span>
                  {searchingSidebar && <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />}
                </div>
                {newPeopleResults.length > 0 ? (
                  newPeopleResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectPerson(u)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all border-b border-gray-50 dark:border-gray-700/50 group"
                    >
                      <div className="relative">
                        <img
                          src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&bold=true`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all"
                        />
                        {presence[u.id]?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {u.name}
                        </p>
                        {u.department && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.department}</p>
                        )}
                      </div>
                      <Send className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                    </button>
                  ))
                ) : (
                  !searchingSidebar && (
                    <div className="text-center text-gray-400 text-xs py-3">No matching people.</div>
                  )
                )}
              </div>
            )}

            {searchKeyword.trim() && searchResults !== null && (
              <div className="border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-between items-center px-4 py-2 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Messages
                  </span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-4">
                    No matching messages.
                  </div>
                ) : (
                  searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const otherId = m.senderId === me?.id ? m.receiverId : m.senderId;
                        const otherName = m.senderId === me?.id ? m.receiverName : m.senderName;
                        const otherImage = m.senderId === me?.id ? m.receiverImage : m.senderImage;
                        openChat({ 
                          userId: otherId, 
                          userName: otherName, 
                          profileImage: otherImage 
                        });
                        clearSidebarSearch();
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

            {filteredConversations.length === 0 ? (
              searchKeyword.trim() ? (
                !searchingSidebar &&
                newPeopleResults.length === 0 &&
                (searchResults === null || searchResults.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-[40%] text-center px-4 py-10">
                    <Search className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No results found</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-[60%] text-center px-4">
                  <EmptyState
                    bare
                    icon={MessageSquare}
                    iconClassName="w-10 h-10 text-gray-400"
                    iconWrapperClassName="w-20 h-20"
                    title="No conversations yet"
                    titleClassName="text-gray-500 dark:text-gray-400 font-medium"
                    message={
                      <>
                        Click the <UserPlus className="w-3 h-3 inline" /> icon to start a new chat
                      </>
                    }
                    messageClassName="text-xs text-gray-400 dark:text-gray-500 mt-1"
                  />
                </div>
              )
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => openChat(c)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-200 border-b border-gray-50 dark:border-gray-700/50 group ${
                    activeUser?.userId === c.userId ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20" : ""
                  }`}
                >
                  <div className="relative">
                    {storyMap[c.userId] ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStoryViewerUser({
                            userId: c.userId,
                            userName: c.userName,
                            profileImage: c.profileImage,
                          });
                        }}
                        className="block rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-amber-400 p-[2.5px]"
                        title="View story"
                      >
                        <img
                          src={c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName)}&background=dc2626&color=fff&bold=true`}
                          alt={c.userName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-gray-800"
                        />
                      </button>
                    ) : (
                      <img
                        src={c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName)}&background=dc2626&color=fff&bold=true`}
                        alt={c.userName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all duration-300"
                      />
                    )}
                    {presence[c.userId]?.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    )}
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

          <div className={`md:col-span-2 flex flex-col ${!activeUser ? "hidden md:flex" : ""}`}>
            {!activeUser ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <EmptyState
                  bare
                  icon={MessageSquare}
                  iconClassName="w-10 h-10 text-gray-400"
                  iconWrapperClassName="w-20 h-20"
                  title="Select a conversation"
                  titleClassName="font-medium text-gray-500 dark:text-gray-400"
                  message="Choose a chat to start messaging or start a new one"
                  messageClassName="text-xs text-gray-400 dark:text-gray-500 mt-1"
                >
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="btn-primary mt-4 px-6 py-2.5 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    New Message
                  </button>
                </EmptyState>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
                  <button 
                    onClick={() => setActiveUser(null)} 
                    className="md:hidden text-white hover:bg-white/20 p-1.5 rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {storyMap[activeUser.userId] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setStoryViewerUser({
                          userId: activeUser.userId,
                          userName: activeUser.userName,
                          profileImage: activeUser.profileImage,
                        })
                      }
                      className="rounded-full bg-gradient-to-tr from-white via-amber-200 to-white/70 p-[2.5px]"
                      title="View story"
                    >
                      <img
                        src={activeUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.userName)}&background=fff&color=dc2626&bold=true`}
                        alt={activeUser.userName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    </button>
                  ) : (
                    <img
                      src={activeUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.userName)}&background=fff&color=dc2626&bold=true`}
                      alt={activeUser.userName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                    />
                  )}
                  <div>
                    <span className="font-bold text-white">{activeUser.userName}</span>
                    <p className="text-white/70 text-[10px] flex items-center gap-1">
                      {presence[activeUser.userId]?.isOnline ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          Online
                        </>
                      ) : (
                        formatLastSeen(presence[activeUser.userId]?.lastSeenAt) && (
                          <>Active {formatLastSeen(presence[activeUser.userId]?.lastSeenAt)}</>
                        )
                      )}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <button 
                      onClick={() => window.location.href = `/profile/${activeUser.userId}`}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                    >
                      <User className="w-4 h-4" />
                    </button>
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

                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-800/30"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Say hello to {activeUser.userName}!</p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isMine = m.senderId === me?.id;
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
                                {m.mediaType === MessageMediaType.Voice ? (
                                  <VoiceMessageBubble
                                    src={resolveMediaUrl(m.mediaUrl)}
                                    durationSeconds={m.durationSeconds}
                                    isMine={isMine}
                                  />
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                )}
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
                                    {m.mediaType !== MessageMediaType.Voice && (
                                      <button 
                                        onClick={() => { setEditingId(m.id); setEditText(m.text); }} 
                                        className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() =>
                                        m.mediaType === MessageMediaType.Voice
                                          ? deleteVoiceMessage(m.id)
                                          : deleteForEveryone(m.id)
                                      } 
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

                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex gap-2">
                  {isRecording ? (
                    <VoiceRecorderBar
                      seconds={recordingSeconds}
                      onCancel={handleCancelRecording}
                      onSend={handleSendRecording}
                      sending={sendingVoice}
                    />
                  ) : (
                    <>
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
                        className="flex-1 input-premium py-2.5 text-sm"
                      />
                      {text.trim() ? (
                        <button 
                          onClick={sendMessage} 
                          disabled={sending} 
                          className="btn-primary px-5 py-2.5 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        >
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      ) : (
                        <button
                          onClick={handleMicClick}
                          disabled={sendingVoice}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                          title="Record a voice message"
                        >
                          {sendingVoice ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {storyViewerUser && storyMap[storyViewerUser.userId] && (
        <StoryViewerModal
          group={{
            userId: storyViewerUser.userId,
            userName: storyViewerUser.userName,
            userProfileImage: storyViewerUser.profileImage,
            stories: storyMap[storyViewerUser.userId],
          }}
          isOwner={storyViewerUser.userId === me?.id}
          onClose={() => setStoryViewerUser(null)}
          onDeleted={(storyId) =>
            setStoryMap((prev) => {
              const remaining = (prev[storyViewerUser.userId] || []).filter((s) => s.id !== storyId);
              if (remaining.length === 0) {
                const { [storyViewerUser.userId]: _drop, ...rest } = prev;
                return rest;
              }
              return { ...prev, [storyViewerUser.userId]: remaining };
            })
          }
        />
      )}
    </div>
  );
}