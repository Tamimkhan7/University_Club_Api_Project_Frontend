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
    if (!confirm("Are you sure? This action cannot be undone!")) return;
    
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Cover Section - Red Theme */}
        <div className="relative">
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700"></div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="relative group">
              <img
                src={edit.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(edit.name)}&background=dc2626&color=fff&size=120&bold=true&length=2`}
                alt={edit.name}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-full ring-2 ring-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Profile Card - Red Theme */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 mt-16 overflow-hidden border border-white/30 dark:border-gray-700/50">
          
          {/* Profile Header */}
          <div className="pt-16 pb-4 px-6 text-center border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {edit.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
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

          {/* Stats Cards - Red Theme */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-red-50/30 to-rose-50/30 dark:from-red-900/10 dark:to-rose-900/10">
            {[
              { icon: Sparkles, label: "Posts", value: stats.posts, color: "red" },
              { icon: UsersIcon, label: "Clubs", value: stats.clubs, color: "purple" },
              { icon: Heart, label: "Followers", value: stats.followers, color: "pink" },
              { icon: User, label: "Following", value: stats.following, color: "orange" },
            ].map((stat) => {
              const Icon = stat.icon;
              const colorClasses = {
                red: "text-red-600 dark:text-red-400",
                purple: "text-purple-600 dark:text-purple-400",
                pink: "text-pink-600 dark:text-pink-400",
                orange: "text-orange-600 dark:text-orange-400",
              };
              return (
                <div key={stat.label} className="text-center group cursor-pointer">
                  <div className="text-xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                    <Icon className={`w-3 h-3 ${colorClasses[stat.color]}`} />
                    <span>{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bio */}
          {edit.bio && !isEditing && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-red-50/20 to-rose-50/20">
              <p className="text-gray-600 dark:text-gray-300 italic text-center">
                "{edit.bio}"
              </p>
            </div>
          )}

          {/* Tabs - Red Theme */}
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
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-gray-800 dark:text-white font-medium mt-1">{edit.name || "Not set"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Department</label>
                      <p className="text-gray-800 dark:text-white font-medium mt-1">{edit.department || "Not set"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Batch</label>
                      <p className="text-gray-800 dark:text-white font-medium mt-1">{edit.batch || "Not set"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Location</label>
                      <p className="text-gray-800 dark:text-white font-medium mt-1">{edit.location || "Not set"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input 
                      value={edit.name} 
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })} 
                      placeholder="Full Name" 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
                    />
                    <input 
                      value={edit.location} 
                      onChange={(e) => setEdit({ ...edit, location: e.target.value })} 
                      placeholder="Location" 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
                    />
                    <div>
                      <input 
                        value={edit.profileImage} 
                        onChange={(e) => setEdit({ ...edit, profileImage: e.target.value })} 
                        placeholder="Profile Image URL" 
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
                      />
                      {edit.profileImage && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
                          <img src={edit.profileImage} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input 
                        value={edit.department} 
                        onChange={(e) => setEdit({ ...edit, department: e.target.value })} 
                        placeholder="Department" 
                        className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" 
                      />
                      <input 
                        value={edit.batch} 
                        onChange={(e) => setEdit({ ...edit, batch: e.target.value })} 
                        placeholder="Batch" 
                        className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" 
                      />
                    </div>
                    <textarea 
                      value={edit.bio} 
                      onChange={(e) => setEdit({ ...edit, bio: e.target.value })} 
                      placeholder="Bio" 
                      rows="4" 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all resize-none"
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={cancelEditing} 
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={updateProfile} 
                        disabled={updating} 
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && (
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-red-500" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Star, title: "Early Bird", earned: true, color: "amber" },
                    { icon: Zap, title: "Active Member", earned: stats.posts >= 10, color: "yellow" },
                    { icon: UsersIcon, title: "Social Butterfly", earned: stats.clubs >= 5, color: "purple" },
                    { icon: Heart, title: "Popular", earned: stats.followers >= 100, color: "pink" },
                    { icon: Crown, title: "Influencer", earned: stats.followers >= 50, color: "gold" },
                    { icon: MessageCircle, title: "Engager", earned: stats.posts >= 5, color: "blue" },
                  ].map((badge, idx) => {
                    const Icon = badge.icon;
                    const colorClasses = {
                      amber: "from-amber-500 to-orange-500",
                      yellow: "from-yellow-500 to-amber-500",
                      purple: "from-purple-500 to-pink-500",
                      pink: "from-pink-500 to-rose-500",
                      gold: "from-yellow-400 to-amber-600",
                      blue: "from-blue-500 to-cyan-500",
                    };
                    return (
                      <div 
                        key={idx} 
                        className={`rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                          badge.earned 
                            ? `bg-gradient-to-r ${colorClasses[badge.color]} text-white shadow-lg` 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 opacity-60"
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-semibold text-sm">{badge.title}</h4>
                        {!badge.earned && (
                          <p className="text-xs mt-1 opacity-75">Locked</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone - Red Theme */}
          {isOwnProfile && !isEditing && (
            <div className="p-6 border-t border-red-100 dark:border-red-900/30 bg-gradient-to-r from-red-50/20 to-rose-50/20">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone
                  </h4>
                  <p className="text-xs text-gray-500">Delete your account permanently - this action cannot be undone</p>
                </div>
                <button 
                  onClick={deleteAccount} 
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
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