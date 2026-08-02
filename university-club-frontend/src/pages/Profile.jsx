import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import storyApi from "../api/story";
import StoryViewerModal from "../components/Story/StoryViewerModal";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import {
  Mail, Save, Edit3, Sparkles, MapPin, Heart, Users as UsersIcon,
  Trash2, X, Loader2, Camera, UserPlus, UserMinus, Lock, EyeOff, Eye,
  LogOut, Shield, Award, Crown, Star, Zap, Rocket, Calendar, Clock,
  Compass, Gift, Gem, BadgeCheck, ChevronRight, Settings, Bell,
  Share2, Link2, User, Building2, BookOpen, Target, Globe,
  Phone, MessageCircle, ShieldOff, ShieldAlert
} from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, logout, updateUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({ name: "", userName: "", bio: "", department: "", batch: "" });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0, profileViews: 0 });
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [isPrivate, setIsPrivateState] = useState(false);
  const [mutualList, setMutualList] = useState([]);
  const [listModal, setListModal] = useState(null);
  const [listItems, setListItems] = useState([]);

  const [profileStories, setProfileStories] = useState([]); // StoryResponseDto[]
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let profileRes;
      const own = !id || (me && Number(id) === me.id);
      if (own) {
        profileRes = await api.get("/user/profile");
        setIsOwnProfile(true);
      } else {
        profileRes = await api.get(`/user/profile/${id}`);
        setIsOwnProfile(false);
        api.post(`/user/profile-views/${id}`).catch(() => {});
      }
      setProfile(profileRes.data);
      setEdit({
        name: profileRes.data.name || "",
        userName: profileRes.data.userName || "",
        bio: profileRes.data.bio || "",
        department: profileRes.data.department || "",
        batch: profileRes.data.batch || "",
      });

      const targetId = own ? (me?.id ?? profileRes.data.id) : Number(id);
      try {
        const statsRes = await api.get(`/user/stats/${targetId}`);
        setStats(statsRes.data);
      } catch {
        setStats({ followers: 0, following: 0, posts: 0, profileViews: 0 });
      }

      if (own) {
        setIsPrivateState(!!profileRes.data.isPrivate);
      } else {
        // Skip mutual-followers lookup if the relationship is blocked either way —
        // avoids an extra failed call and keeps the UI clean for blocked users.
        if (!profileRes.data.isBlocked) {
          try {
            const mutualRes = await api.get(`/user/mutual/${id}`, { params: { page: 1, pageSize: 10 } });
            setMutualList(mutualRes.data?.items || []);
          } catch {
            setMutualList([]);
          }
        } else {
          setMutualList([]);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast.error("User not found");
        navigate("/");
      } else {
        toast.error(getErrorMessage(error, "Failed to load profile"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setProfileStories([]);
    if (!profile?.id) return;

    storyApi
      .getUserStories(profile.id)
      .then((res) => {
        if (!cancelled) setProfileStories(res || []);
      })
      .catch(() => {
        // A blocked relationship (reported as "not found") or a private profile
        // simply means no stories to show here - fail silently.
        if (!cancelled) setProfileStories([]);
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const updateProfile = async () => {
    if (!edit.name.trim()) return toast.error("Name is required");
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("Name", edit.name);
      formData.append("Bio", edit.bio || "");
      formData.append("Department", edit.department || "");
      formData.append("Batch", edit.batch || "");
      formData.append("UserName", edit.userName || "");
      if (profileImageFile) formData.append("ProfileImage", profileImageFile);
      if (coverPhotoFile) formData.append("CoverPhoto", coverPhotoFile);

      const res = await api.put("/user/update", formData);
      await loadProfile();
      setIsEditing(false);
      setProfileImageFile(null);
      setCoverPhotoFile(null);
      updateUser({ name: res.data?.name, profileImage: res.data?.profileImage });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || newPassword.length < 6) {
      return toast.error("Enter current password and a new password (6+ chars)");
    }
    try {
      await api.put("/user/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to change password"));
    }
  };

  const togglePrivacy = async () => {
    const next = !isPrivate;
    try {
      await api.put("/user/privacy", null, { params: { isPrivate: next } });
      setIsPrivateState(next);
      toast.success(`Account is now ${next ? "private" : "public"}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update privacy"));
    }
  };

  const deactivateAccount = async () => {
    if (!confirm("Deactivate your account? You can ask an admin to reactivate it later.")) return;
    try {
      await api.put("/user/deactivate");
      toast.success("Account deactivated");
      logout();
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to deactivate account"));
    }
  };

  const openList = async (type) => {
    const targetId = isOwnProfile ? me?.id ?? profile.id : Number(id);
    try {
      const res = await api.get(`/user/${type}/${targetId}`, { params: { page: 1, pageSize: 30 } });
      setListItems(res.data?.items || []);
      setListModal(type);
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to load ${type}`));
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone!")) return;
    try {
      await api.delete("/user/delete");
      toast.success("Account deleted successfully");
      logout();
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete account"));
    }
  };

  const toggleFollow = async () => {
    if (!profile) return;
    setFollowBusy(true);
    try {
      if (profile.isFollowing) {
        await api.delete(`/user/follow/${profile.id}`);
      } else {
        await api.post(`/user/follow/${profile.id}`);
      }
      setProfile((p) => ({ ...p, isFollowing: !p.isFollowing }));
      setStats((s) => ({ ...s, followers: s.followers + (profile.isFollowing ? -1 : 1) }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setFollowBusy(false);
    }
  };

  // BLOCK / UNBLOCK — this was completely missing before, which is why
  // "blocked" users still showed up in search and could still be messaged:
  // no block relationship was ever created in the database.
  const toggleBlock = async () => {
    if (!profile) return;

    if (!profile.isBlocked) {
      if (!confirm(`Block ${profile.name}? They won't be able to find or message you, and you won't see them either.`)) {
        return;
      }
    }

    setBlockBusy(true);
    try {
      if (profile.isBlocked) {
        await api.delete(`/user/unblock/${profile.id}`);
        toast.success(`${profile.name} unblocked`);
      } else {
        await api.post(`/user/block/${profile.id}`);
        toast.success(`${profile.name} blocked`);
      }
      // Blocking also removes any follow relationship server-side (both directions),
      // so reflect that immediately in local state instead of waiting for a refetch.
      setProfile((p) => ({
        ...p,
        isBlocked: !p.isBlocked,
        isFollowing: p.isBlocked ? p.isFollowing : false,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setBlockBusy(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setProfileImageFile(null);
    setCoverPhotoFile(null);
    setEdit({
      name: profile?.name || "",
      userName: profile?.userName || "",
      bio: profile?.bio || "",
      department: profile?.department || "",
      batch: profile?.batch || "",
    });
  };

  if (loading) return <Loader />;
  if (!profile) return null;

  const displayImage = profileImageFile ? URL.createObjectURL(profileImageFile) : profile.profileImage;
  const displayCover = coverPhotoFile ? URL.createObjectURL(coverPhotoFile) : profile.coverPhoto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6">
        
        {/* Cover Photo */}
        <div className="relative">
          <div className="relative h-56 sm:h-64 md:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/10">
            {displayCover ? (
              <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-red-700 to-amber-600">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {isEditing && (
              <label className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2.5 rounded-xl cursor-pointer shadow-xl flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 border border-white/20">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Change Cover</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setCoverPhotoFile(e.target.files[0])} />
              </label>
            )}
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 sm:left-8 sm:translate-x-0">
            <div className="relative group">
              {profileStories.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowStoryViewer(true)}
                  className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-amber-400 p-[3px] animate-pulse-slow"
                  title="View story"
                >
                  <span className="block w-full h-full rounded-full border-4 border-white dark:border-gray-800" />
                </button>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              )}
              <img
                src={displayImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(edit.name)}&background=dc2626&color=fff&size=120&bold=true&length=2`}
                alt={edit.name}
                onClick={() => profileStories.length > 0 && setShowStoryViewer(true)}
                className={`relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105 ${
                  profileStories.length > 0 ? "cursor-pointer" : ""
                }`}
              />
              {isEditing && (
                <label className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setProfileImageFile(e.target.files[0])} />
                </label>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg shadow-green-500/30" />
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-3xl shadow-2xl shadow-red-500/10 mt-20 sm:mt-16 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/15">
          
          {/* Header */}
          <div className="pt-20 sm:pt-16 pb-4 px-6 text-center border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent flex items-center justify-center sm:justify-start gap-2">
                  {profile.name}
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                </h1>
                {profile.userName && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="text-gray-400">@</span>{profile.userName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 justify-center flex-wrap">
                {isOwnProfile && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
                {!isOwnProfile && (
                  <>
                    {/* Follow button hidden once blocked in either direction — following
                        a blocked user isn't a valid state and the backend rejects it. */}
                    {!profile.isBlocked && (
                      <button
                        onClick={toggleFollow}
                        disabled={followBusy}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                          profile.isFollowing
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            : "btn-primary"
                        }`}
                      >
                        {profile.isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {profile.isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    )}

                    <button
                      onClick={toggleBlock}
                      disabled={blockBusy}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        profile.isBlocked
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40"
                      }`}
                    >
                      {blockBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : profile.isBlocked ? (
                        <ShieldOff className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                      {profile.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex items-center justify-center gap-2 mt-3 text-gray-500 dark:text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
            )}

            {!isOwnProfile && profile.isBlocked && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5" />
                You and this user are blocked from interacting.
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-red-50/30 to-rose-50/30 dark:from-red-900/10 dark:to-rose-900/10">
            {[
              { icon: Sparkles, label: "Posts", value: stats.posts },
              { icon: Heart, label: "Followers", value: stats.followers },
              { icon: UsersIcon, label: "Following", value: stats.following },
              { icon: Eye, label: "Views", value: stats.profileViews },
            ].map((stat) => {
              const Icon = stat.icon;
              const clickable = stat.label === "Followers" || stat.label === "Following";
              return (
                <button
                  key={stat.label}
                  type="button"
                  onClick={clickable ? () => openList(stat.label.toLowerCase()) : undefined}
                  className={`text-center p-2 rounded-xl transition-all duration-200 ${
                    clickable ? "hover:bg-white/50 dark:hover:bg-gray-700/50 hover:scale-105" : ""
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 mt-1">
                    <Icon className="w-3.5 h-3.5 text-red-500" />
                    <span>{stat.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mutual Followers */}
          {!isOwnProfile && mutualList.length > 0 && (
            <div className="px-6 py-3 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center gap-2 flex-wrap bg-gray-50/30 dark:bg-gray-800/30">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Mutual followers:</span>
              {mutualList.slice(0, 5).map((m) => (
                <span key={m.id} className="text-xs bg-white dark:bg-gray-700 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600">
                  {m.name}
                </span>
              ))}
              {mutualList.length > 5 && (
                <span className="text-xs text-gray-400">+{mutualList.length - 5} more</span>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && !isEditing && (
            <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-red-50/20 to-rose-50/20 dark:from-red-900/10 dark:to-rose-900/10">
              <p className="text-gray-600 dark:text-gray-300 italic text-center text-base">"{profile.bio}"</p>
            </div>
          )}

          {/* Profile Information */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                {isEditing ? "Edit Profile" : "Profile Information"}
              </h3>
            </div>

            {!isEditing ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 transition-all duration-200">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Full Name</label>
                  <p className="text-gray-800 dark:text-white font-semibold mt-1.5">{profile.name || "Not set"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 transition-all duration-200">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Department</label>
                  <p className="text-gray-800 dark:text-white font-semibold mt-1.5">{profile.department || "Not set"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 transition-all duration-200">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Batch</label>
                  <p className="text-gray-800 dark:text-white font-semibold mt-1.5">{profile.batch || "Not set"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 transition-all duration-200">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Username</label>
                  <p className="text-gray-800 dark:text-white font-semibold mt-1.5">{profile.userName || "Not set"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-slideDown">
                <input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  placeholder="Full Name"
                  className="input-premium"
                />
                <input
                  value={edit.userName}
                  onChange={(e) => setEdit({ ...edit, userName: e.target.value })}
                  placeholder="Username"
                  className="input-premium"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={edit.department}
                    onChange={(e) => setEdit({ ...edit, department: e.target.value })}
                    placeholder="Department"
                    className="input-premium"
                  />
                  <input
                    value={edit.batch}
                    onChange={(e) => setEdit({ ...edit, batch: e.target.value })}
                    placeholder="Batch"
                    className="input-premium"
                  />
                </div>
                <textarea
                  value={edit.bio}
                  onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
                  placeholder="Bio"
                  rows="4"
                  className="input-premium resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={updating}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings for Own Profile */}
          {isOwnProfile && !isEditing && (
            <>
              <div className="px-6 py-5 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all duration-200">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Private Account
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Only approved followers can see your profile details.</p>
                </div>
                <button
                  onClick={togglePrivacy}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isPrivate
                      ? "btn-primary"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {isPrivate ? "🔒 Private" : "🌐 Public"}
                </button>
              </div>

              <div className="px-6 py-5 border-t border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all duration-200">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
                >
                  <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Change Password
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showPasswordForm ? "rotate-90" : ""}`} />
                </button>
                {showPasswordForm && (
                  <div className="mt-4 space-y-3 max-w-sm animate-slideDown">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="input-premium pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (6+ chars)"
                      className="input-premium"
                    />
                    <button
                      onClick={changePassword}
                      className="btn-primary px-6 py-2.5 text-sm"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="px-6 py-5 border-t border-red-200/50 dark:border-red-900/30 bg-gradient-to-r from-red-50/30 to-rose-50/30 dark:from-red-900/20 dark:to-rose-900/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Danger Zone
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delete your account permanently - this action cannot be undone</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { logout(); navigate("/login"); }}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                    <button
                      onClick={deactivateAccount}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 text-sm font-medium"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={deleteAccount}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* List Modal */}
      {listModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setListModal(null)}
        >
          <div
            className="glass-card rounded-3xl shadow-2xl max-w-sm w-full max-h-[70vh] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
              <div className="relative flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  {listModal === "followers" ? <Heart className="w-4 h-4 text-white" /> : <UsersIcon className="w-4 h-4 text-white" />}
                </div>
                <h3 className="font-bold text-white capitalize">{listModal}</h3>
              </div>
              <button
                onClick={() => setListModal(null)}
                className="relative p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-60px)] divide-y divide-gray-100 dark:divide-gray-700">
              {listItems.length === 0 ? (
                <div className="empty-state py-12">
                  <div className="icon w-16 h-16">
                    <UsersIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No users to show</p>
                </div>
              ) : (
                listItems.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
                    <div className="relative">
                      <img
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=dc2626&color=fff&bold=true`}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-red-500/30 transition-all"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {u.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showStoryViewer && profileStories.length > 0 && (
        <StoryViewerModal
          group={{
            userId: profile.id,
            userName: profile.name,
            userProfileImage: profile.profileImage,
            stories: profileStories,
          }}
          isOwner={isOwnProfile}
          onClose={() => setShowStoryViewer(false)}
          onDeleted={(storyId) =>
            setProfileStories((prev) => prev.filter((s) => s.id !== storyId))
          }
        />
      )}
    </div>
  );
}
