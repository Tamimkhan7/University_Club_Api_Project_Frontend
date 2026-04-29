import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { 
  User, Mail, BookOpen, Calendar, Save, Trash2, Edit3, Camera, 
  Sparkles, MapPin, Briefcase, Award, Heart, Share2, Settings,
  CheckCircle, XCircle, Clock, Globe, Linkedin, Github, Twitter,
  Shield, Bell, Moon, Sun, Plus, Minus, ChevronRight, Activity
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({
    name: "",
    bio: "",
    department: "",
    batch: "",
    profileImage: "",
    location: "",
    website: "",
    socialLinks: { github: "", linkedin: "", twitter: "" }
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/profile");
      setProfile(res.data);
      setEdit({
        name: res.data.name || "",
        bio: res.data.bio || "",
        department: res.data.department || "",
        batch: res.data.batch || "",
        profileImage: res.data.profileImage || "",
        location: res.data.location || "",
        website: res.data.website || "",
        socialLinks: res.data.socialLinks || { github: "", linkedin: "", twitter: "" }
      });
      
      // Load user stats
      const postsRes = await api.get("/user/posts/count");
      setStats({
        posts: postsRes.data || 0,
        followers: 128,
        following: 42
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const update = async () => {
    setUpdating(true);
    try {
      await api.put("/user/update", edit);
      alert("Profile updated successfully!");
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone! All your data will be permanently deleted.")) return;
    
    try {
      await api.delete("/user/delete");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
      {/* Profile Header with Cover Photo */}
      <div className="relative">
        {/* Cover Photo with Animation */}
        <div className="relative h-64 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 right-4">
            {isEditing && (
              <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-white/30 transition">
                <Camera className="w-4 h-4" />
                Change Cover
              </button>
            )}
          </div>
        </div>
        
        {/* Profile Image with Floating Animation */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition"></div>
            <img
              src={edit.profileImage || `https://ui-avatars.com/api/?name=${edit.name}&background=3b82f6&color=fff&size=150&bold=true`}
              alt={edit.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover bg-white relative z-10 transition-transform duration-300 group-hover:scale-105"
            />
            {isEditing && (
              <label className="absolute bottom-2 right-2 z-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 cursor-pointer hover:shadow-lg transition shadow-md">
                <Camera className="w-4 h-4 text-white" />
                <input type="text" className="hidden" />
              </label>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-20"></div>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl shadow-xl mt-20 overflow-hidden">
        {/* User Info Header */}
        <div className="pt-20 pb-6 px-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex justify-center gap-2 mb-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-blue-400 rounded-full"></div>
            ))}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {edit.name || "User"}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <Mail className="w-3 h-3" />
              {profile?.email}
            </div>
            {edit.location && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <MapPin className="w-3 h-3" />
                  {edit.location}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-2">
            <Calendar className="w-3 h-3" />
            <span>Member since {new Date(profile?.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-slate-100 bg-white">
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.posts}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Posts
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.followers}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3" />
              Followers
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.following}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <User className="w-3 h-3" />
              Following
            </div>
          </div>
        </div>

        {/* Bio Section with Quote Design */}
        {edit.bio && !isEditing && (
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="relative">
              <div className="absolute -top-3 -left-2 text-4xl text-blue-200 opacity-50">"</div>
              <p className="text-slate-600 italic text-center px-6 py-2">{edit.bio}</p>
              <div className="absolute -bottom-3 -right-2 text-4xl text-blue-200 opacity-50">"</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          {/* Header with Edit Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h3 className="font-bold text-lg text-slate-800">Profile Information</h3>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 group"
              >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEdit({
                      name: profile?.name || "",
                      bio: profile?.bio || "",
                      department: profile?.department || "",
                      batch: profile?.batch || "",
                      profileImage: profile?.profileImage || "",
                      location: profile?.location || "",
                      website: profile?.website || "",
                      socialLinks: profile?.socialLinks || { github: "", linkedin: "", twitter: "" }
                    });
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={update}
                  disabled={updating}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {updating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            // Display Mode - Grid Layout
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <User className="w-4 h-4" />
                  <label className="text-xs text-slate-500 uppercase font-semibold">Full Name</label>
                </div>
                <p className="text-slate-800 font-medium">{edit.name || "Not set"}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <label className="text-xs text-slate-500 uppercase font-semibold">Department</label>
                </div>
                <p className="text-slate-800 font-medium">{edit.department || "Not set"}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-purple-500 mb-2">
                  <Award className="w-4 h-4" />
                  <label className="text-xs text-slate-500 uppercase font-semibold">Batch</label>
                </div>
                <p className="text-slate-800 font-medium">{edit.batch || "Not set"}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <label className="text-xs text-slate-500 uppercase font-semibold">Location</label>
                </div>
                <p className="text-slate-800 font-medium">{edit.location || "Not set"}</p>
              </div>

              {edit.website && (
                <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition">
                  <div className="flex items-center gap-2 text-indigo-500 mb-2">
                    <Globe className="w-4 h-4" />
                    <label className="text-xs text-slate-500 uppercase font-semibold">Website</label>
                  </div>
                  <a href={edit.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {edit.website}
                  </a>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode - Enhanced Form
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4 text-blue-500" />
                    Full Name
                  </label>
                  <input
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Location
                  </label>
                  <input
                    value={edit.location}
                    onChange={(e) => setEdit({ ...edit, location: e.target.value })}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Camera className="w-4 h-4 text-purple-500" />
                  Profile Image URL
                </label>
                <input
                  value={edit.profileImage}
                  onChange={(e) => setEdit({ ...edit, profileImage: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full"
                />
                {edit.profileImage && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Custom image will be used
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    Department
                  </label>
                  <input
                    value={edit.department}
                    onChange={(e) => setEdit({ ...edit, department: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4 text-purple-500" />
                    Batch
                  </label>
                  <input
                    value={edit.batch}
                    onChange={(e) => setEdit({ ...edit, batch: e.target.value })}
                    placeholder="e.g., 2024"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Website
                </label>
                <input
                  value={edit.website}
                  onChange={(e) => setEdit({ ...edit, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Bio
                </label>
                <textarea
                  value={edit.bio}
                  onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full resize-none"
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {edit.bio?.length || 0}/500 characters
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone with Confirmation */}
          {!isEditing && (
            <div className="mt-8 pt-6 border-t-2 border-red-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </div>
                    <h4 className="font-semibold text-red-600">Danger Zone</h4>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Once you delete your account, there is no going back.</p>
                </div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition shadow-md hover:shadow-lg"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteAccount}
                      className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition shadow-md"
                    >
                      Confirm Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Profile last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Private profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}