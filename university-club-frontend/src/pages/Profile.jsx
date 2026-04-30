import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { 
  User, Mail, Calendar, Save, Edit3, Sparkles, MapPin, 
  Award, Heart, Users, Trash2, X, Loader2, Globe, 
  MessageCircle, Image as ImageIcon
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, clubs: 0 });
  const [isOwnProfile, setIsOwnProfile] = useState(true);

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
        location: profileRes.data.location || ""
      });
      
      // Load user stats
      try {
        const postsRes = await api.get("/user/posts/count");
        const clubsRes = await api.get("/club/my-clubs");
        setStats({ 
          posts: postsRes.data || 0, 
          followers: 128, 
          following: 42,
          clubs: clubsRes.data?.length || 0
        });
      } catch (err) {
        console.error("Error loading stats:", err);
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
        location: edit.location
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
    if (!confirm("Are you sure? This action cannot be undone! All your data will be permanently deleted.")) return;
    
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
      location: profile?.location || ""
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
      {/* Cover & Avatar */}
      <div className="relative">
        <div className="relative h-56 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
          <div className="absolute bottom-4 right-4">
            {isEditing && (
              <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Change Cover
              </button>
            )}
          </div>
        </div>
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative group">
            <img
              src={edit.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(edit.name)}&background=3b82f6&color=fff&size=150&bold=true`}
              alt={edit.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isEditing && (
              <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 cursor-pointer shadow-md">
                <Edit3 className="w-3 h-3 text-white" />
              </label>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl mt-20 overflow-hidden">
        <div className="pt-20 pb-6 px-6 text-center border-b border-slate-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {edit.name}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm">
            <Mail className="w-3 h-3" /> {profile?.email}
          </div>
          {edit.location && (
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {edit.location}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-2">
            <Calendar className="w-3 h-3" />
            <span>Member since {new Date(profile?.createdAt).toLocaleDateString("en-US", {
              month: "long", year: "numeric"
            })}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-100">
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.posts}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Posts
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.clubs}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> Clubs
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.followers}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3" /> Followers
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.following}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <User className="w-3 h-3" /> Following
            </div>
          </div>
        </div>

        {edit.bio && !isEditing && (
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="relative">
              <div className="absolute -top-3 -left-2 text-4xl text-blue-200 opacity-50">"</div>
              <p className="text-slate-600 italic text-center px-6 py-2">{edit.bio}</p>
              <div className="absolute -bottom-3 -right-2 text-4xl text-blue-200 opacity-50">"</div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h3 className="font-bold text-lg text-slate-800">Profile Information</h3>
            </div>
            {isOwnProfile && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-4 py-2 rounded-xl hover:shadow-md transition group"
              >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition" />
                Edit Profile
              </button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <button 
                  onClick={cancelEditing} 
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateProfile} 
                  disabled={updating} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
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
                  <Award className="w-4 h-4" />
                  <label className="text-xs text-slate-500 uppercase font-semibold">Department</label>
                </div>
                <p className="text-slate-800 font-medium">{edit.department || "Not set"}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-purple-500 mb-2">
                  <Calendar className="w-4 h-4" />
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
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input 
                  value={edit.name} 
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })} 
                  placeholder="Full Name" 
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input 
                  value={edit.location} 
                  onChange={(e) => setEdit({ ...edit, location: e.target.value })} 
                  placeholder="Dhaka, Bangladesh" 
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Image URL</label>
                <input 
                  value={edit.profileImage} 
                  onChange={(e) => setEdit({ ...edit, profileImage: e.target.value })} 
                  placeholder="https://example.com/avatar.jpg" 
                  className="w-full"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <input 
                    value={edit.department} 
                    onChange={(e) => setEdit({ ...edit, department: e.target.value })} 
                    placeholder="Computer Science" 
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Batch</label>
                  <input 
                    value={edit.batch} 
                    onChange={(e) => setEdit({ ...edit, batch: e.target.value })} 
                    placeholder="2024" 
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
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

          {isOwnProfile && !isEditing && (
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
                    className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition shadow-md"
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>Profile last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3" />
              <span>{stats.posts} total posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}