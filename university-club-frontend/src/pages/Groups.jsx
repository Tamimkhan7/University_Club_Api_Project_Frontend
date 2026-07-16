import { useEffect, useState, useRef, useContext } from "react";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Users, Plus, X, Send, Trash2, Edit2, Check, ArrowLeft, LogOut,
  UserPlus, UserMinus, Crown, Loader2, Search,
} from "lucide-react";

export default function Groups() {
  const { user: me } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null); // GroupSummaryDto
  const [details, setDetails] = useState(null); // GroupDetailsDto
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [memberIdsInput, setMemberIdsInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [addMemberId, setAddMemberId] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [userResults, setUserResults] = useState([]);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const loadGroups = async () => {
    try {
      const res = await api.get("/group");
      setGroups(res.data || []);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadGroupData = async (groupId) => {
    try {
      const [detailsRes, msgRes] = await Promise.all([
        api.get(`/group/${groupId}`),
        api.get(`/group/${groupId}/messages`, { params: { page: 1, pageSize: 50 } }),
      ]);
      setDetails(detailsRes.data);
      setMessages(msgRes.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load group"));
    }
  };

  const openGroup = (group) => {
    setActiveGroup(group);
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
      loadGroupData(activeGroup.id);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const saveGroupName = async () => {
    if (!editNameValue.trim()) return;
    try {
      await api.put(`/group/${activeGroup.id}`, { name: editNameValue.trim() });
      toast.success("Group updated");
      setEditingName(false);
      loadGroupData(activeGroup.id);
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update group"));
    }
  };

  const deleteGroup = async () => {
    if (!confirm("Delete this group for everyone?")) return;
    try {
      await api.delete(`/group/${activeGroup.id}`);
      toast.success("Group deleted");
      setActiveGroup(null);
      setDetails(null);
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
      loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave group"));
    }
  };

  const doSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchUsers.trim()) return;
    try {
      const res = await api.get("/user/search", { params: { query: searchUsers.trim(), page: 1, pageSize: 10 } });
      setUserResults(res.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/group/${activeGroup.id}/members`, { userId });
      toast.success("Member added");
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
    try {
      await api.delete(`/group/${activeGroup.id}/members/${memberId}`);
      toast.success("Member removed");
      loadGroupData(activeGroup.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove member"));
    }
  };

  const toggleAdmin = async (userId, makeAdmin) => {
    try {
      await api.patch(`/group/${activeGroup.id}/members/admin`, { userId, isAdmin: makeAdmin });
      toast.success(makeAdmin ? "Promoted to admin" : "Admin removed");
      loadGroupData(activeGroup.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update admin status"));
    }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 overflow-hidden border border-white/30 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-3 h-[75vh]">
          {/* Group list */}
          <div className={`border-r border-gray-100 dark:border-gray-700 overflow-y-auto ${activeGroup ? "hidden md:block" : ""}`}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> Groups
              </h2>
              <button onClick={() => setShowCreateForm(!showCreateForm)} className="text-white">
                {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>

            {showCreateForm && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-2">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
                />
                <input
                  value={memberIdsInput}
                  onChange={(e) => setMemberIdsInput(e.target.value)}
                  placeholder="Member user IDs, comma separated (optional)"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
                />
                <button onClick={createGroup} className="w-full bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Create Group
                </button>
              </div>
            )}

            {groups.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No groups yet.</p>
              </div>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => openGroup(g)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition border-b border-gray-50 dark:border-gray-700/50 ${
                    activeGroup?.id === g.id ? "bg-red-50 dark:bg-red-900/20" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {g.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">{g.name}</span>
                      {g.isAdmin && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{g.lastMessage || `${g.memberCount} members`}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat panel */}
          <div className={`md:col-span-2 flex flex-col ${!activeGroup ? "hidden md:flex" : ""}`}>
            {!activeGroup ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p>Select a group</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3">
                  <button onClick={() => setActiveGroup(null)} className="md:hidden text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {editingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} className="rounded px-2 py-1 text-sm text-black flex-1" />
                      <button onClick={saveGroupName} className="text-white"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingName(false)} className="text-white"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <span className="font-bold text-white flex-1">{details?.name || activeGroup.name}</span>
                  )}
                  <button onClick={() => { setEditingName(true); setEditNameValue(details?.name || activeGroup.name); }} className="text-white/90">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowMembers(!showMembers)} className="text-white/90">
                    <Users className="w-4 h-4" />
                  </button>
                </div>

                {showMembers && details && (
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 max-h-56 overflow-y-auto space-y-2">
                    <form onSubmit={doSearchUsers} className="flex gap-2 mb-2">
                      <input value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} placeholder="Search users to add" className="flex-1 px-3 py-1.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900" />
                      <button type="submit" className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"><Search className="w-4 h-4" /></button>
                    </form>
                    {userResults.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {userResults.map((u) => (
                          <div key={u.id} className="flex items-center justify-between text-sm">
                            <span>{u.name} (#{u.id})</span>
                            <button onClick={() => addMember(u.id)} className="text-green-600"><UserPlus className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mb-2">
                      <input value={addMemberId} onChange={(e) => setAddMemberId(e.target.value)} placeholder="Or add by user ID" className="flex-1 px-3 py-1.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900" />
                      <button onClick={addMemberManual} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm">Add</button>
                    </div>
                    {details.members.map((m) => (
                      <div key={m.userId} className="flex items-center justify-between text-sm py-1">
                        <span className="flex items-center gap-1">
                          {m.name} {m.isAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => toggleAdmin(m.userId, !m.isAdmin)} className="text-blue-500 text-xs">
                            {m.isAdmin ? "Unadmin" : "Make Admin"}
                          </button>
                          {m.userId !== me?.id && (
                            <button onClick={() => removeMember(m.userId)} className="text-red-500"><UserMinus className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={leaveGroup} className="flex-1 flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm">
                        <LogOut className="w-3.5 h-3.5" /> Leave
                      </button>
                      <button onClick={deleteGroup} className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm">
                        <Trash2 className="w-3.5 h-3.5" /> Delete Group
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const isMine = m.senderId === me?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] ${isMine ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"} rounded-2xl px-4 py-2`}>
                          {!isMine && <p className="text-xs font-semibold mb-0.5 opacity-70">{m.senderName}</p>}
                          <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                          <span className={`text-[10px] ${isMine ? "text-white/70" : "text-gray-400"}`}>{formatTime(m.createdAt)}</span>
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
                  <button onClick={sendMessage} disabled={sending || !text.trim()} className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl disabled:opacity-50">
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
