import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Radio, Users, MessageCircle, Send, Mic, MicOff, UserX, ShieldBan,
  ExternalLink, ArrowLeft, Loader2, Play, Square, ChevronDown,
  Crown, Shield, Eye, Video, Sparkles, Copy, RefreshCw, Ban, Lock,
  AlertTriangle, Clock, CheckCircle2
} from "lucide-react";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import liveEventApi from "../api/liveEvent";
import createLiveEventConnection from "../api/liveEventHub";

const STATUS_META = {
  NotStarted: { label: "Not Started", dot: "bg-gray-400" },
  Live: { label: "Live Now", dot: "bg-red-500" },
  Ended: { label: "Ended", dot: "bg-gray-400" },
};

// LiveStatus can arrive from the API as a number (enum) or a string depending
// on serializer config, so normalize both shapes to the same key.
const normalizeStatus = (status) => {
  if (status === 0 || status === "NotStarted") return "NotStarted";
  if (status === 1 || status === "Live") return "Live";
  if (status === 2 || status === "Ended") return "Ended";
  return "NotStarted";
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function LiveEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // LiveSessionResponseDto
  const [membership, setMembership] = useState(null);
  const [notAMember, setNotAMember] = useState(false);

  const [meetingLinkInput, setMeetingLinkInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [messages, setMessages] = useState([]);
  const [chatPage, setChatPage] = useState(1);
  const [chatTotalPages, setChatTotalPages] = useState(1);
  const [chatText, setChatText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [banned, setBanned] = useState(false);
  const [connectionState, setConnectionState] = useState("connecting"); // connecting | connected | disconnected

  const [viewers, setViewers] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [activeTab, setActiveTab] = useState("chat"); // chat | viewers
  const [unbanUserId, setUnbanUserId] = useState("");

  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  const status = normalizeStatus(session?.status);
  const canManage = membership?.role === "Admin" || membership?.role === "Moderator";
  const isAdmin = membership?.role === "Admin";

  // ---------- Loading ----------

  const loadStatus = useCallback(async () => {
    try {
      const data = await liveEventApi.getStatus(eventId);
      setSession(data);
      return data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load live session"));
      return null;
    }
  }, [eventId]);

  const loadMembership = useCallback(async (clubId) => {
    if (!clubId) return;
    try {
      const res = await api.get(`/club/${clubId}/membership`);
      setMembership(res.data);
      setNotAMember(false);
    } catch {
      setNotAMember(true);
    }
  }, []);

  const loadChatHistory = useCallback(async (page = 1) => {
    try {
      const data = await liveEventApi.getChatHistory(eventId, { page, pageSize: 30 });
      const items = (data.items || []).slice().reverse(); // API returns newest-first; we render oldest-first
      setChatPage(data.page || 1);
      setChatTotalPages(data.totalPages || 1);
      setMessages((prev) => (page === 1 ? items : [...items, ...prev]));
    } catch (error) {
      // Non-members get a friendly failure message rather than a raw error toast on first load
      if (page === 1) console.error(error);
    }
  }, [eventId]);

  const loadViewers = useCallback(async () => {
    try {
      const data = await liveEventApi.getActiveViewers(eventId);
      setViewers(data || []);
      setViewerCount((data || []).length);
    } catch (error) {
      console.error(error);
    }
  }, [eventId]);

  const init = useCallback(async () => {
    setLoading(true);
    const data = await loadStatus();
    if (data?.clubId) {
      await loadMembership(data.clubId);
    }
    if (data && normalizeStatus(data.status) !== "NotStarted") {
      await loadChatHistory(1);
    }
    if (data && normalizeStatus(data.status) === "Live") {
      await loadViewers();
    }
    setLoading(false);
  }, [loadStatus, loadMembership, loadChatHistory, loadViewers]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Refresh the viewer list (with mute/ban flags) periodically while live and manageable
  useEffect(() => {
    if (status !== "Live") return;
    const interval = setInterval(loadViewers, 8000);
    return () => clearInterval(interval);
  }, [status, loadViewers]);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ---------- SignalR (join room, live chat, moderation pushes) ----------

  useEffect(() => {
    if (notAMember) return undefined;

    const connection = createLiveEventConnection();
    connectionRef.current = connection;

    connection.on("LiveStarted", (payload) => {
      setSession((prev) => ({
        ...(prev || {}),
        status: 1,
        meetingLink: payload.meetingLink,
        liveStartedAt: payload.startedAt,
      }));
      toast.success("The live session has started!");
    });

    connection.on("LiveEnded", (payload) => {
      setSession((prev) => ({ ...(prev || {}), status: 2, liveEndedAt: payload.endedAt }));
      toast("This live session has ended.", { icon: "🔴" });
    });

    connection.on("ReceiveLiveMessage", (dto) => {
      shouldAutoScroll.current = true;
      setMessages((prev) => [...prev, dto]);
    });

    connection.on("ViewerCountUpdated", (payload) => {
      setViewerCount(payload.viewerCount ?? 0);
    });

    connection.on("MuteStatusChanged", (payload) => {
      setIsMuted(!!payload.isMuted);
      if (payload.isMuted) toast("You have been muted in this live session.", { icon: "🔇" });
    });

    connection.on("KickedFromLive", (payload) => {
      setBanned(!!payload.banned);
      toast.error(payload.banned ? "You have been banned from this live session." : "You were removed from this live session.");
    });

    connection.on("JoinRejected", (payload) => {
      setBanned(true);
      toast.error(payload?.reason || "You cannot join this live session.");
    });

    connection.on("MessageRejected", (payload) => {
      toast.error(payload?.reason || "Your message could not be sent.");
    });

    connection.onreconnecting(() => setConnectionState("connecting"));
    connection.onreconnected(() => {
      setConnectionState("connected");
      connection.invoke("JoinLiveRoom", Number(eventId)).catch(() => {});
    });
    connection.onclose(() => setConnectionState("disconnected"));

    connection
      .start()
      .then(() => {
        setConnectionState("connected");
        return connection.invoke("JoinLiveRoom", Number(eventId));
      })
      .catch((err) => {
        console.error("Live hub connection failed:", err);
        setConnectionState("disconnected");
      });

    return () => {
      connection.invoke("LeaveLiveRoom", Number(eventId)).catch(() => {});
      connection.stop();
    };
  }, [eventId, notAMember]);

  // ---------- Actions ----------

  const startLive = async () => {
    if (!meetingLinkInput.trim()) return toast.error("Meeting link is required");
    setStarting(true);
    try {
      const data = await liveEventApi.start(eventId, meetingLinkInput.trim());
      setSession(data);
      toast.success("Live session started!");
      loadChatHistory(1);
      loadViewers();
    } catch (error) {
      toast.error(error.message || getErrorMessage(error, "Failed to start live session"));
    } finally {
      setStarting(false);
    }
  };

  const endLive = async () => {
    if (!confirm("End this live session for everyone?")) return;
    setEnding(true);
    try {
      const data = await liveEventApi.end(eventId);
      setSession(data);
      toast.success("Live session ended.");
    } catch (error) {
      toast.error(error.message || getErrorMessage(error, "Failed to end live session"));
    } finally {
      setEnding(false);
    }
  };

  const sendMessage = async () => {
    const text = chatText.trim();
    if (!text) return;
    const connection = connectionRef.current;
    if (!connection || connection.state !== "Connected") {
      return toast.error("Not connected to the live chat right now.");
    }
    try {
      await connection.invoke("SendLiveMessage", Number(eventId), text);
      setChatText("");
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  const toggleMute = async (userId, mute) => {
    try {
      await liveEventApi.muteUser(eventId, userId, mute);
      toast.success(mute ? "User muted." : "User unmuted.");
      loadViewers();
    } catch (error) {
      toast.error(error.message || "Action failed.");
    }
  };

  const kickUser = async (userId, ban) => {
    if (!confirm(ban ? "Kick and ban this user from the live session?" : "Kick this user from the live session?")) return;
    try {
      await liveEventApi.kickUser(eventId, userId, ban);
      toast.success(ban ? "User kicked and banned." : "User kicked.");
      loadViewers();
    } catch (error) {
      toast.error(error.message || "Action failed.");
    }
  };

  const unbanUser = async (userId) => {
    const id = Number(userId);
    if (!id) return toast.error("Enter a valid user ID");
    try {
      await liveEventApi.unbanUser(eventId, id);
      toast.success("User unbanned.");
      setUnbanUserId("");
    } catch (error) {
      toast.error(error.message || "Action failed.");
    }
  };

  const copyMeetingLink = () => {
    if (!session?.meetingLink) return;
    navigator.clipboard.writeText(session.meetingLink);
    toast.success("Meeting link copied!");
  };

  const handleMessagesScroll = (e) => {
    const el = e.target;
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  if (loading) return <Loader />;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-gray-500">This live session could not be found.</p>
          <Link to="/events" className="btn-primary mt-4 inline-flex">Back to Events</Link>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {/* Hero */}
        <div className="relative mb-6">
          <div className="page-hero p-6 sm:p-8">
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="page-hero-icon flex-shrink-0">
                  <Radio className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <span className="hero-pill mb-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot} ${status === "Live" ? "animate-pulse" : ""}`} />
                    {meta.label}
                    {status === "Live" && (
                      <>
                        <span className="w-px h-3 bg-white/30" />
                        <Users className="w-3.5 h-3.5" /> {viewerCount}
                      </>
                    )}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-2 truncate">{session.title}</h1>
                  <p className="text-white/80 text-sm mt-1 truncate">{session.clubName}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {status === "Live" && session.meetingLink && (
                  <>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost-dark"
                    >
                      <ExternalLink className="w-4 h-4" /> Join Meeting
                    </a>
                    <button onClick={copyMeetingLink} className="btn-ghost-dark">
                      <Copy className="w-4 h-4" /> Copy Link
                    </button>
                  </>
                )}
                {canManage && status === "Live" && (
                  <button
                    onClick={endLive}
                    disabled={ending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white text-red-600 hover:bg-red-50 shadow-lg transition-all disabled:opacity-50"
                  >
                    {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                    End Live
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {notAMember ? (
          <div className="glass-card rounded-3xl shadow-xl p-12 text-center">
            <div className="empty-state">
              <div className="icon"><Lock className="w-12 h-12 text-red-500" /></div>
              <h3>Members only</h3>
              <p>You need to be a member of {session.clubName || "this club"} to view this live session.</p>
            </div>
          </div>
        ) : banned ? (
          <div className="glass-card rounded-3xl shadow-xl p-12 text-center">
            <div className="empty-state">
              <div className="icon"><Ban className="w-12 h-12 text-red-500" /></div>
              <h3>Access removed</h3>
              <p>You have been removed from this live session.</p>
            </div>
          </div>
        ) : status === "NotStarted" ? (
          <div className="glass-card rounded-3xl shadow-xl p-8 sm:p-12 text-center">
            {canManage ? (
              <div className="max-w-md mx-auto">
                <div className="empty-state !pb-4">
                  <div className="icon"><Video className="w-12 h-12 text-red-500" /></div>
                  <h3>Go live for your club</h3>
                  <p>Paste your meeting link (Zoom, Google Meet, Jitsi, YouTube Live, etc.) to start streaming.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <input
                    value={meetingLinkInput}
                    onChange={(e) => setMeetingLinkInput(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="input-premium"
                  />
                  <button onClick={startLive} disabled={starting} className="btn-primary flex-shrink-0">
                    {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Start Live
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="icon"><Clock className="w-12 h-12 text-red-500" /></div>
                <h3>Not live yet</h3>
                <p>This event's live session hasn't started. Check back soon!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-3xl shadow-xl overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center text-center p-8">
                  {status === "Ended" ? (
                    <>
                      <CheckCircle2 className="w-14 h-14 text-gray-400 mb-3" />
                      <p className="text-white font-semibold text-lg">This live session has ended</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {session.liveEndedAt && `Ended at ${formatTime(session.liveEndedAt)}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-full text-white text-xs font-bold">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
                      </div>
                      <Video className="w-14 h-14 text-white/70 mb-3" />
                      <p className="text-white font-semibold">Streaming externally</p>
                      <p className="text-gray-400 text-sm mt-1 max-w-sm">
                        This session streams via an external meeting link. Click "Join Meeting" above to open it.
                      </p>
                      {session.liveStartedAt && (
                        <p className="text-gray-500 text-xs mt-3">Started at {formatTime(session.liveStartedAt)}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Tabs (mobile-friendly: chat/viewers under video too on small screens handled by column order) */}
            </div>

            {/* Side panel: Chat / Viewers */}
            <div className="glass-card rounded-3xl shadow-xl flex flex-col h-[600px] overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-700/60">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                    activeTab === "chat" ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
                <button
                  onClick={() => setActiveTab("viewers")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                    activeTab === "viewers" ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Eye className="w-4 h-4" /> Viewers <span className="text-xs">({viewerCount})</span>
                </button>
              </div>

              {activeTab === "chat" ? (
                <>
                  {chatPage < chatTotalPages && (
                    <button
                      onClick={() => loadChatHistory(chatPage + 1)}
                      className="text-xs text-red-500 hover:text-red-600 font-medium py-2 flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Load older messages
                    </button>
                  )}
                  <div
                    onScroll={handleMessagesScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-800/30"
                  >
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm font-medium">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((m, i) => {
                        const isMine = m.userId === me?.id;
                        return (
                          <div key={m.id ?? i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeIn`}>
                            <div
                              className={`max-w-[80%] ${
                                isMine ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                              } rounded-2xl px-3.5 py-2 shadow-md`}
                            >
                              {!isMine && (
                                <p className="text-xs font-semibold mb-0.5 opacity-80">{m.userName}</p>
                              )}
                              <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{m.message}</p>
                              <span className={`text-[10px] ${isMine ? "text-white/60" : "text-gray-400"} mt-1 block`}>
                                {formatTime(m.sentAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {status === "Live" && (
                    <div className="p-3 border-t border-gray-100 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50">
                      {isMuted ? (
                        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5">
                          <MicOff className="w-3.5 h-3.5" /> You are muted in this live session.
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder={connectionState === "connected" ? "Say something..." : "Connecting..."}
                            disabled={connectionState !== "connected"}
                            maxLength={500}
                            className="flex-1 input-premium py-2.5 text-sm"
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!chatText.trim() || connectionState !== "connected"}
                            className="btn-primary px-4 py-2.5 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {canManage && (
                    <div className="mb-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 flex gap-2">
                      <input
                        value={unbanUserId}
                        onChange={(e) => setUnbanUserId(e.target.value)}
                        placeholder="User ID to unban"
                        type="number"
                        className="flex-1 input-premium py-2 text-xs"
                      />
                      <button
                        onClick={() => unbanUser(unbanUserId)}
                        className="btn-secondary px-3 py-2 text-xs flex-shrink-0"
                      >
                        Unban
                      </button>
                    </div>
                  )}
                  {viewers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                      <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm font-medium">No one is watching yet</p>
                    </div>
                  ) : (
                    viewers.map((v) => (
                      <div
                        key={v.userId}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(v.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex items-center gap-1">
                              {v.userName}
                              {v.userId === me?.id && <span className="text-gray-400 text-xs">(you)</span>}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {v.isMuted && <span className="text-[10px] text-amber-600 flex items-center gap-0.5"><MicOff className="w-2.5 h-2.5" /> muted</span>}
                              {v.isBanned && <span className="text-[10px] text-red-600 flex items-center gap-0.5"><Ban className="w-2.5 h-2.5" /> banned</span>}
                            </div>
                          </div>
                        </div>
                        {canManage && v.userId !== me?.id && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => toggleMute(v.userId, !v.isMuted)}
                              title={v.isMuted ? "Unmute" : "Mute"}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            >
                              {v.isMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => kickUser(v.userId, false)}
                              title="Kick"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => kickUser(v.userId, true)}
                              title="Kick + Ban"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <ShieldBan className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!canManage && status === "Live" && !isAdmin && (
          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Only club Admins/Moderators can manage this live session.
          </p>
        )}
      </div>
    </div>
  );
}
