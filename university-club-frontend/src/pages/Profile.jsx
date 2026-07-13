import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import {
  Mail, Save, Edit3, Sparkles, MapPin,
  Heart, Users as UsersIcon, Trash2, X, Loader2, Camera,
  UserPlus, UserMinus, Lock, EyeOff, Eye, LogOut,
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

  // password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

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
        // record a profile view (best-effort)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="relative">
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
            {displayCover ? (
              <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700"></div>
            )}
            <div className="absolute inset-0 bg-black/10"></div>
            {isEditing && (
              <label className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-xl cursor-pointer shadow-lg flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Camera className="w-4 h-4" /> Change Cover
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setCoverPhotoFile(e.target.files[0])} />
              </label>
            )}
          </div>

          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="relative group">
              <img
                src={displayImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(edit.name)}&background=dc2626&color=fff&size=120&bold=true&length=2`}
                alt={edit.name}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {isEditing && (
                <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setProfileImageFile(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 mt-16 overflow-hidden border border-white/30 dark:border-gray-700/50">
          <div className="pt-16 pb-4 px-6 text-center border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {profile.name}
            </h1>
            {profile.userName && <p className="text-gray-500 text-sm mt-1">@{profile.userName}</p>}
            {isOwnProfile && (
              <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
            )}

            {!isOwnProfile && (
              <button
                onClick={toggleFollow}
                disabled={followBusy}
                className={`mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
                  profile.isFollowing
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                }`}
              >
                {profile.isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {profile.isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-red-50/30 to-rose-50/30 dark:from-red-900/10 dark:to-rose-900/10">
            {[
              { icon: Sparkles, label: "Posts", value: stats.posts },
              { icon: Heart, label: "Followers", value: stats.followers },
              { icon: UsersIcon, label: "Following", value: stats.following },
              { icon: Eye, label: "Views", value: stats.profileViews },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                    <Icon className="w-3 h-3 text-red-500" /> <span>{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {profile.bio && !isEditing && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-red-50/20 to-rose-50/20">
              <p className="text-gray-600 dark:text-gray-300 italic text-center">"{profile.bio}"</p>
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                {isEditing ? "Edit Profile" : "Profile Information"}
              </h3>
              {isOwnProfile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Full Name</label>
                  <p className="text-gray-800 dark:text-white font-medium mt-1">{profile.name || "Not set"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Department</label>
                  <p className="text-gray-800 dark:text-white font-medium mt-1">{profile.department || "Not set"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Batch</label>
                  <p className="text-gray-800 dark:text-white font-medium mt-1">{profile.batch || "Not set"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Username</label>
                  <p className="text-gray-800 dark:text-white font-medium mt-1">{profile.userName || "Not set"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Full Name" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" />
                <input value={edit.userName} onChange={(e) => setEdit({ ...edit, userName: e.target.value })} placeholder="Username" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" />
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={edit.department} onChange={(e) => setEdit({ ...edit, department: e.target.value })} placeholder="Department" className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" />
                  <input value={edit.batch} onChange={(e) => setEdit({ ...edit, batch: e.target.value })} placeholder="Batch" className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" />
                </div>
                <textarea value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} placeholder="Bio" rows="4" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all resize-none" />
                <div className="flex gap-3">
                  <button onClick={cancelEditing} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                    Cancel
                  </button>
                  <button onClick={updateProfile} disabled={updating} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {isOwnProfile && !isEditing && (
            <>
              <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium hover:text-red-600 transition"
                >
                  <Lock className="w-4 h-4" /> Change Password
                </button>
                {showPasswordForm && (
                  <div className="mt-4 space-y-3 max-w-sm">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (6+ chars)"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400"
                    />
                    <button onClick={changePassword} className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-red-100 dark:border-red-900/30 bg-gradient-to-r from-red-50/20 to-rose-50/20">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Danger Zone
                    </h4>
                    <p className="text-xs text-gray-500">Delete your account permanently - this action cannot be undone</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                    <button onClick={deleteAccount} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
