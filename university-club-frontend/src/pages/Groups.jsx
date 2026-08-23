import { useEffect, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage, toArray } from "../api/axios";
import voiceMessageApi, { resolveMediaUrl, MessageMediaType } from "../api/voiceMessage";
import useVoiceRecorder from "../hooks/useVoiceRecorder";
import VoiceRecorderBar from "../components/VoiceRecorderBar";
import VoiceMessageBubble from "../components/VoiceMessageBubble";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import { formatClockTime as formatTime } from "../utils/dateUtils";
import {
  Users, Plus, X, Send, Trash2, Edit2, Check, ArrowLeft, LogOut,
  UserPlus, UserMinus, Crown, Loader2, Search, Mic,
  MessageCircle, Heart, Sparkles, Zap, Star, Award,
  Clock, Shield, ShieldCheck, User, Hash, Globe, Compass,
  ChevronRight, MoreHorizontal, Bell, Settings, Settings2,
  Building2, BookOpen, Target, Eye, ThumbsUp,
  Mail, UserCircle, Link2, AtSign, ChevronDown,
} from "lucide-react";

export default function Groups() {
  const { user: me } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [details, setDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [memberIdsInput, setMemberIdsInput] = useState("");

  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [infoTab, setInfoTab] = useState("members"); 

  const [editNameValue, setEditNameValue] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const [addMemberId, setAddMemberId] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [openRoleMenuFor, setOpenRoleMenuFor] = useState(null);
  const [sendingVoice, setSendingVoice] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const pollRef = useRef(null);

  const searchDebounceRef = useRef(null);

  const loadGroups = async () => {
    try {
      const res = await api.get("/group");
     
      setGroups(toArray(res.data));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load groups"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    const interval = setInterval(loadGroups, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

   useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [messages]);

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScroll.current = distanceFromBottom < 120;
  };

  const loadGroupData = async (groupId) => {
    try {
      const [detailsRes, msgRes] = await Promise.all([
        api.get(`/group/${groupId}`),
        api.get(`/group/${groupId}/messages`, { params: { page: 1, pageSize: 50 } }),
      ]);

      const d = detailsRes.data;
      setDetails(d ? { ...d, members: toArray(d.members) } : null);
      setMessages(msgRes.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load group"));
    }
  };

  const openGroup = (group) => {
    if (isRecording) cancelRecording();
    setActiveGroup(group);
    setShowInfoDrawer(false);
    shouldAutoScroll.current = true;
    loadGroupData(group.id);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadGroupData(group.id), 4000);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Group name required");
    const memberIds = memberIdsInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    try {
      await api.post("/group", { name: newGroupName.trim(), memberIds });
      toast.success("Group created!");
      setNewGroupName("");
      setMemberIdsInput("");
      setShowCreateForm(false);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create group"));
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeGroup) return;
    setSending(true);
    try {
      await api.post("/group/message", { groupId: activeGroup.id, text: text.trim() });
      setText("");
      shouldAutoScroll.current = true;
      loadGroupData(activeGroup.id);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const sendVoiceBlob = async (blob, durationSeconds, extension) => {
    if (!activeGroup || !blob || blob.size === 0) return;
    setSendingVoice(true);
    try {
      await voiceMessageApi.sendGroup(activeGroup.id, blob, durationSeconds, `voice-message.${extension}`);
      shouldAutoScroll.current = true;
      loadGroupData(activeGroup.id);
      loadGroups();
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
    if (!activeGroup) return;
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
      await voiceMessageApi.deleteGroup(id);
      loadGroupData(activeGroup.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete voice message"));
    }
  };

  const openInfoDrawer = (tab = "members") => {
    setEditNameValue(details?.name || activeGroup?.name || "");
    setInfoTab(tab);
    setShowInfoDrawer(true);
  };

  const saveGroupSettings = async () => {
    if (!editNameValue.trim()) return toast.error("Group name required");
    setSavingSettings(true);
    try {
      await api.put(`/group/${activeGroup.id}`, { name: editNameValue.trim() });
      toast.success("Group updated");
      loadGroupData(activeGroup.id);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update group"));
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteGroup = async () => {
    if (!confirm("Delete this group for everyone? This cannot be undone.")) return;
    try {
      await api.delete(`/group/${activeGroup.id}`);
      toast.success("Group deleted");
      setActiveGroup(null);
      setDetails(null);
      setShowInfoDrawer(false);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete group"));
    }
  };

  const leaveGroup = async () => {
    if (!confirm("Leave this group?")) return;
    try {
      await api.delete(`/group/${activeGroup.id}/leave`);
      toast.success("Left group");
      setActiveGroup(null);
      setDetails(null);
      setShowInfoDrawer(false);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave group"));
    }
  };


  const runUserSearch = async (term) => {
    setIsSearchingUsers(true);
    try {
      const res = await api.get("/user/search", {
        params: { query: term, page: 1, pageSize: 10 },
      });
      setUserResults(res.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSearchingUsers(false);
    }
  };

  useEffect(() => {
    if (!showInfoDrawer || infoTab !== "members") return;
    const term = searchUsers.trim();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!term) {
      setUserResults([]);
      setIsSearchingUsers(false);
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      runUserSearch(term);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchUsers, showInfoDrawer, infoTab]);

  const doSearchUsers = (e) => {
    e.preventDefault();
    const term = searchUsers.trim();
    if (!term) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    runUserSearch(term);
  };

  const clearMemberSearch = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchUsers("");
    setUserResults([]);
    setIsSearchingUsers(false);
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/group/${activeGroup.id}/members`, { userId });
      toast.success("Member added");
      clearMemberSearch();
      loadGroupData(activeGroup.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add member"));
    }
  };

  const addMemberManual = async () => {
    const id = parseInt(addMemberId, 10);
    if (isNaN(id)) return toast.error("Enter a valid user ID");
    await addMember(id);
    setAddMemberId("");
  };

  const removeMember = async (memberId) => {
    if (!confirm("Remove this member from the group?")) return;
    try {
      await api.delete(`/group/${activeGroup.id}/members/${memberId}`);
      toast.success("Member removed");
      loadGroupData(activeGroup.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove member"));
    } finally {
      setOpenRoleMenuFor(null);
    }
  };

  const toggleAdmin = async (userId, makeAdmin) => {
    try {
      await api.patch(`/group/${activeGroup.id}/members/admin`, { userId, isAdmin: makeAdmin });
      toast.success(makeAdmin ? "Promoted to admin" : "Admin removed");
      loadGroupData(activeGroup.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update admin status"));
    } finally {
      setOpenRoleMenuFor(null);
    }
  };

  // formatTime এখন src/utils/dateUtils.js থেকে আসছে (formatClockTime)

  const myMembership = details?.members?.find((m) => m.userId === me?.id);
  const myIsAdmin = !!myMembership?.isAdmin;
  const isCreator = !!details && me?.id === details.createdBy;

  const roleLabel = (m) =>
    m.userId === details?.createdBy ? "Owner" : m.isAdmin ? "Admin" : "Member";

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">

      <BackgroundDecoration />

      <div className="relative max-w-6xl mx-auto px-4 py-6 sm:py-8">

        {/* Header */}
        <div className="relative mb-6">
          <div className="page-hero rounded-2xl p-5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="relative flex items-center gap-3 flex-wrap">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Group Chats</h1>
                <p className="text-white/80 text-xs sm:text-sm">Connect and collaborate with your community</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium hover:bg-white/30 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Group
                </button>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                  {groups.length} groups
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden h-[75vh] grid grid-cols-1 md:grid-cols-3">
          <div className={`border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto ${activeGroup ? "hidden md:block" : ""}`}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> Groups
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{groups.length}</span>
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>

            {showCreateForm && (
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 space-y-3 bg-gray-50/50 dark:bg-gray-800/50 animate-slideDown">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="input-premium py-2.5 text-sm"
                />
                <input
                  value={memberIdsInput}
                  onChange={(e) => setMemberIdsInput(e.target.value)}
                  placeholder="Member user IDs, comma separated (optional)"
                  className="input-premium py-2.5 text-sm"
                />
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    You can add members after creating the group
                  </span>
                </div>
                <button onClick={createGroup} className="btn-primary w-full py-2.5 text-sm">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Create Group
                </button>
              </div>
            )}

            {groups.length === 0 ? (
              <div className="empty-state py-16">
                <div className="icon w-16 h-16">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No groups yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first group</p>
                <button onClick={() => setShowCreateForm(true)} className="btn-primary mt-4 px-6 py-2.5 text-sm">
                  <Plus className="w-4 h-4" />
                  Create Group
                </button>
              </div>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => openGroup(g)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-200 border-b border-gray-50 dark:border-gray-700/50 group ${
                    activeGroup?.id === g.id ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                      {g.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {g.isAdmin && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {g.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{g.memberCount}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {g.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </div>

          <div className={`md:col-span-2 flex flex-col relative ${!activeGroup ? "hidden md:flex" : ""}`}>
            {!activeGroup ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <EmptyState
                  bare
                  icon={Users}
                  iconClassName="w-10 h-10 text-gray-400"
                  iconWrapperClassName="w-20 h-20"
                  title="Select a group"
                  titleClassName="font-medium text-gray-500 dark:text-gray-400"
                  message="Choose a group to start chatting"
                  messageClassName="text-xs text-gray-400 dark:text-gray-500 mt-1"
                >
                  <button onClick={() => setShowCreateForm(true)} className="btn-primary mt-4 px-6 py-2.5 text-sm">
                    <Plus className="w-4 h-4" />
                    Create Group
                  </button>
                </EmptyState>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className="md:hidden text-white hover:bg-white/20 p-1.5 rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => openInfoDrawer("settings")}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                      {details?.name?.charAt(0)?.toUpperCase() || activeGroup.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white truncate block">{details?.name || activeGroup.name}</span>
                      <span className="text-white/70 text-xs">{details?.members?.length || 0} members</span>
                    </div>
                  </button>

                  <button
                    onClick={() => openInfoDrawer("members")}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-all relative"
                    title="Members"
                  >
                    <Users className="w-4 h-4" />
                    {details?.members?.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                        {details.members.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => openInfoDrawer("settings")}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-all"
                    title="Group settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-800/30"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to send a message!</p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isMine = m.senderId === me?.id;
                      const showSender = !isMine && (index === 0 || messages[index - 1]?.senderId !== m.senderId);
                      return (
                        <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeIn`}>
                          <div
                            className={`relative group max-w-[75%] ${
                              isMine ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            } rounded-2xl px-4 py-2.5 shadow-lg ${!isMine ? "shadow-gray-200/50 dark:shadow-gray-700/30" : "shadow-red-500/20"}`}
                          >
                            {showSender && (
                              <p className="text-xs font-semibold mb-0.5 opacity-80 flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">
                                  {m.senderName?.charAt(0)?.toUpperCase()}
                                </div>
                                {m.senderName}
                              </p>
                            )}
                            {m.mediaType === MessageMediaType.Voice ? (
                              <VoiceMessageBubble
                                src={resolveMediaUrl(m.mediaUrl)}
                                durationSeconds={m.durationSeconds}
                                isMine={isMine}
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                            )}
                            <span className={`text-[10px] ${isMine ? "text-white/60" : "text-gray-400"} mt-1 block`}>
                              {formatTime(m.createdAt)}
                            </span>
                            {isMine && m.mediaType === MessageMediaType.Voice && (
                              <button
                                onClick={() => deleteVoiceMessage(m.id)}
                                className="absolute -top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {!shouldAutoScroll.current && messages.length > 0 && (
                  <button
                    onClick={() => {
                      shouldAutoScroll.current = true;
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                    }}
                    className="absolute bottom-24 right-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full p-2.5 shadow-lg shadow-red-500/30 hover:scale-105 transition-transform"
                    title="Jump to latest"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

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
                          className="btn-primary px-5 py-2.5 disabled:opacity-50 hover:scale-[1.05] disabled:hover:scale-100 flex items-center gap-2"
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

      <div className={`fixed inset-0 z-50 ${showInfoDrawer ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setShowInfoDrawer(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            showInfoDrawer ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            showInfoDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {details && activeGroup && (
            <>
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  {details?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{details?.name}</p>
                  <p className="text-white/70 text-xs">{details?.members?.length || 0} members</p>
                </div>
                <button
                  onClick={() => setShowInfoDrawer(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-gray-200/70 dark:border-gray-700/70">
                {[
                  { key: "members", label: "Members", icon: Users },
                  { key: "settings", label: "Settings", icon: Settings2 },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setInfoTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                      infoTab === tab.key
                        ? "border-red-500 text-red-600 dark:text-red-400"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {infoTab === "members" && (
                  <div className="space-y-4">
                    {myIsAdmin && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add Members</span>
                        </div>

                        <form onSubmit={doSearchUsers} className="flex gap-2">
                          <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isSearchingUsers ? "animate-pulse" : ""}`} />
                            <input
                              value={searchUsers}
                              onChange={(e) => setSearchUsers(e.target.value)}
                              placeholder="Search users to add..."
                              className="input-premium pl-9 pr-9 py-2 text-sm"
                            />
                            {searchUsers && (
                              <button
                                type="button"
                                onClick={clearMemberSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <button type="submit" className="btn-primary px-4 py-2 text-sm">
                            {isSearchingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          </button>
                        </form>

                        {userResults.length > 0 && (
                          <div className={`space-y-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto transition-opacity ${isSearchingUsers ? "opacity-60" : "opacity-100"}`}>
                            {userResults.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center justify-between text-sm px-2 py-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&bold=true`}
                                    alt={u.name}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&bold=true`;
                                    }}
                                    className="w-6 h-6 rounded-full object-cover shrink-0"
                                  />
                                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {u.name} <span className="text-xs text-gray-400">#{u.id}</span>
                                  </span>
                                </div>
                                <button
                                  onClick={() => addMember(u.id)}
                                  className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all hover:scale-105 shrink-0"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              value={addMemberId}
                              onChange={(e) => setAddMemberId(e.target.value)}
                              placeholder="Add by user ID..."
                              className="input-premium pl-9 pr-3 py-2 text-sm"
                            />
                          </div>
                          <button onClick={addMemberManual} className="btn-primary px-4 py-2 text-sm">
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 py-2">
                        <Users className="w-3.5 h-3.5" />
                        Members ({details.members.length})
                      </div>
                      <div className="space-y-1">
                        {details.members.map((m) => (
                          <div
                            key={m.userId}
                            className="flex items-center justify-between text-sm px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                                {m.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {m.name} {m.userId === me?.id && <span className="text-gray-400 text-xs">(you)</span>}
                                </p>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    m.userId === details.createdBy
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                      : m.isAdmin
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                  }`}
                                >
                                  {m.userId === details.createdBy ? (
                                    <Crown className="w-2.5 h-2.5" />
                                  ) : m.isAdmin ? (
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                  ) : null}
                                  {roleLabel(m)}
                                </span>
                              </div>
                            </div>

                            {myIsAdmin && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={() => setOpenRoleMenuFor(openRoleMenuFor === m.userId ? null : m.userId)}
                                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {openRoleMenuFor === m.userId && (
                                  <div className="absolute right-0 top-9 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-44 py-1 text-xs">
                                    {!m.isAdmin && (
                                      <button
                                        onClick={() => toggleAdmin(m.userId, true)}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Make Admin
                                      </button>
                                    )}
                                    {m.isAdmin && (
                                      <button
                                        onClick={() => toggleAdmin(m.userId, false)}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                                      >
                                        <Shield className="w-3.5 h-3.5 text-gray-400" /> Remove Admin
                                      </button>
                                    )}
                                    {m.userId !== me?.id && (
                                      <>
                                        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                        <button
                                          onClick={() => removeMember(m.userId)}
                                          className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                        >
                                          <UserMinus className="w-3.5 h-3.5" /> Remove from Group
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {infoTab === "settings" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Group name</label>
                      <input
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        disabled={!myIsAdmin}
                        className="input-premium py-2.5 text-sm disabled:opacity-60"
                      />
                    </div>
                    {myIsAdmin && (
                      <button
                        onClick={saveGroupSettings}
                        disabled={savingSettings}
                        className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Changes
                      </button>
                    )}

                    <div className="flex gap-2 pt-4 mt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <button
                        onClick={leaveGroup}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Leave
                      </button>
                      {isCreator && (
                        <button
                          onClick={deleteGroup}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Group
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}