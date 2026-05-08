import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { 
  User, Mail, Calendar, Save, Edit3, Sparkles, MapPin, 
  Award, Heart, Users as UsersIcon, Trash2, X, Loader2, Globe, 
  MessageCircle, Image as ImageIcon, Camera, Quote,
  Shield, CheckCircle, TrendingUp, Zap, BookOpen, Coffee, Crown, Star
} from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({ 
    name: "", bio: "", department: "", batch: "", profileImage: "", location: ""
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, clubs: 0 });
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadProfile = async () => {
    setLoading(true);
    try {
      let profileRes;
      if (id) {
        profileRes = await api.get(`/user/profile/${id}`);
        setIsOwnProfile(false);
      } else {
        profileRes = await api.get("/user/profile");
        setIsOwnProfile(true);
      }
      setProfile(profileRes.data);
      setEdit({
        name: profileRes.data.name || "",
        bio: profileRes.data.bio || "",
        department: profileRes.data.department || "",
        batch: profileRes.data.batch || "",
        profileImage: profileRes.data.profileImage || "",
        location: profileRes.data.location || "",
      });
      
      // Load stats
      try {
        const postsRes = await api.get("/user/posts/count");
        setStats({ 
          posts: postsRes.data || 0, 
          followers: profileRes.data.followersCount || 0, 
          following: profileRes.data.followingCount || 0,
          clubs: 0
        });
      } catch (err) {
        setStats({ posts: 0, followers: 0, following: 0, clubs: 0 });
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
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const updateProfile = async () => {
    if (!edit.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setUpdating(true);
    try {
      await api.put("/user/update", {
        name: edit.name,
        bio: edit.bio,
        department: edit.department,
        batch: edit.batch,
        profileImage: edit.profileImage,
        location: edit.location,
      });
      await loadProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm("⚠️ Are you sure? This action cannot be undone!")) return;
    
    try {
      await api.delete("/user/delete");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEdit({
      name: profile?.name || "",
      bio: profile?.bio || "",
      department: profile?.department || "",
      batch: profile?.batch || "",
      profileImage: profile?.profileImage || "",
      location: profile?.location || "",
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn">
        
        {/* Cover Section */}
        <div className="relative">
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <img
                src={edit.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(edit.name)}&background=3b82f6&color=fff&size=120&bold=true&length=2`}
                alt={edit.name}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-16 overflow-hidden">
          
          {/* Profile Header */}
          <div className="pt-16 pb-4 px-6 text-center border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {edit.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 text-sm">
              <Mail className="w-4 h-4" />
              <span>{profile?.email}</span>
            </div>
            {edit.location && (
              <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{edit.location}</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {[
              { icon: Sparkles, label: "Posts", value: stats.posts },
              { icon: UsersIcon, label: "Clubs", value: stats.clubs },
              { icon: Heart, label: "Followers", value: stats.followers },
              { icon: User, label: "Following", value: stats.following },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold text-gray-800 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                    <Icon className="w-3 h-3" />
                    <span>{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bio */}
          {edit.bio && !isEditing && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
              <p className="text-gray-600 dark:text-gray-300 italic text-center">
                "{edit.bio}"
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700 px-6">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "achievements", label: "Achievements", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                    {isEditing ? "Edit Profile" : "Profile Information"}
                  </h3>
                  {isOwnProfile && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <label className="text-xs text-gray-500 uppercase">Full Name</label>
                      <p className="text-gray-800 dark:text-white font-medium">{edit.name || "Not set"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <label className="text-xs text-gray-500 uppercase">Department</label>
                      <p className="text-gray-800 dark:text-white font-medium">{edit.department || "Not set"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <label className="text-xs text-gray-500 uppercase">Batch</label>
                      <p className="text-gray-800 dark:text-white font-medium">{edit.batch || "Not set"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <label className="text-xs text-gray-500 uppercase">Location</label>
                      <p className="text-gray-800 dark:text-white font-medium">{edit.location || "Not set"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input 
                      value={edit.name} 
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })} 
                      placeholder="Full Name" 
                      className="w-full px-4 py-3 border rounded-xl"
                    />
                    <input 
                      value={edit.location} 
                      onChange={(e) => setEdit({ ...edit, location: e.target.value })} 
                      placeholder="Location" 
                      className="w-full px-4 py-3 border rounded-xl"
                    />
                    <input 
                      value={edit.profileImage} 
                      onChange={(e) => setEdit({ ...edit, profileImage: e.target.value })} 
                      placeholder="Profile Image URL" 
                      className="w-full px-4 py-3 border rounded-xl"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input value={edit.department} onChange={(e) => setEdit({ ...edit, department: e.target.value })} placeholder="Department" className="px-4 py-3 border rounded-xl" />
                      <input value={edit.batch} onChange={(e) => setEdit({ ...edit, batch: e.target.value })} placeholder="Batch" className="px-4 py-3 border rounded-xl" />
                    </div>
                    <textarea 
                      value={edit.bio} 
                      onChange={(e) => setEdit({ ...edit, bio: e.target.value })} 
                      placeholder="Bio" 
                      rows="4" 
                      className="w-full px-4 py-3 border rounded-xl resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={cancelEditing} className="flex-1 px-4 py-3 rounded-xl border text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button onClick={updateProfile} disabled={updating} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl">
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && (
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: Star, title: "Early Bird", earned: true },
                    { icon: Zap, title: "Active Member", earned: stats.posts >= 10 },
                    { icon: UsersIcon, title: "Social Butterfly", earned: stats.clubs >= 5 },
                    { icon: Heart, title: "Popular", earned: stats.followers >= 100 },
                  ].map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <div key={idx} className={`rounded-xl p-4 text-center ${badge.earned ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-semibold text-sm">{badge.title}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          {isOwnProfile && !isEditing && (
            <div className="p-6 border-t border-red-100 dark:border-red-900/30">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-red-600">Danger Zone</h4>
                  <p className="text-xs text-gray-500">Delete your account permanently</p>
                </div>
                <button onClick={deleteAccount} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}