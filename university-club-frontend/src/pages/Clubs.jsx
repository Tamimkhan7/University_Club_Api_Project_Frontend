import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { 
  Edit3, Trash2, Users, Plus, X, Check, Sparkles, 
  BookOpen, Calendar, Trophy, Video, Music, Camera,
  Globe, Hash, Award, TrendingUp, UserCheck, UserX,
  Shield, Crown, Star, Heart, MessageCircle, Share2
} from "lucide-react";

export default function Clubs() {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingClub, setEditingClub] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState(new Set());

  const categories = [
    { id: "all", label: "All Clubs", icon: Globe, color: "blue" },
    { id: "academic", label: "Academic", icon: BookOpen, color: "green" },
    { id: "sports", label: "Sports", icon: Trophy, color: "orange" },
    { id: "arts", label: "Arts", icon: Music, color: "purple" },
    { id: "tech", label: "Technology", icon: Video, color: "indigo" },
    { id: "social", label: "Social", icon: Users, color: "pink" },
  ];

  const loadClubs = async () => {
    setLoading(true);
    try {
      const allClubsRes = await api.get("/club/all");
      setClubs(allClubsRes.data);
      
      // Load user's joined clubs - handle gracefully if endpoint doesn't exist
      if (user) {
        try {
          const userClubsRes = await api.get("/club/my");
          const joinedSet = new Set(userClubsRes.data.map(c => c.id));
          setJoinedClubs(joinedSet);
          // Save to localStorage as fallback
          localStorage.setItem("joinedClubs", JSON.stringify([...joinedSet]));
        } catch (err) {
          console.log("Club/my endpoint not available yet, using localStorage fallback");
          // Try to get from localStorage as fallback
          const savedJoined = localStorage.getItem("joinedClubs");
          if (savedJoined) {
            setJoinedClubs(new Set(JSON.parse(savedJoined)));
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const createClub = async () => {
    if (!name.trim()) {
      alert("Please enter club name");
      return;
    }
    
    try {
      await api.post("/club/create", { name, description });
      setName("");
      setDescription("");
      setShowCreateForm(false);
      loadClubs();
      alert("✨ Club created successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create club");
    }
  };

  const joinClub = async (clubId) => {
    try {
      await api.post("/club/join", { clubId });
      const newJoined = new Set(joinedClubs).add(clubId);
      setJoinedClubs(newJoined);
      localStorage.setItem("joinedClubs", JSON.stringify([...newJoined]));
      alert("🎉 Joined club successfully!");
      loadClubs();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Already joined or error occurred");
    }
  };

  const leaveClub = async (clubId) => {
    try {
      await api.delete(`/club/leave/${clubId}`);
      const newJoined = new Set(joinedClubs);
      newJoined.delete(clubId);
      setJoinedClubs(newJoined);
      localStorage.setItem("joinedClubs", JSON.stringify([...newJoined]));
      alert("👋 Left club successfully!");
      loadClubs();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to leave club");
    }
  };

  const updateClub = async (clubId) => {
    if (!editName.trim()) {
      alert("Please enter club name");
      return;
    }
    
    try {
      await api.put(`/club/update/${clubId}`, {
        name: editName,
        description: editDescription
      });
      setEditingClub(null);
      loadClubs();
      alert("✅ Club updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update club");
    }
  };

  const deleteClub = async (clubId) => {
    if (!confirm("⚠️ Are you sure you want to delete this club? All posts will also be deleted!")) return;
    
    try {
      await api.delete(`/club/delete/${clubId}`);
      loadClubs();
      alert("🗑️ Club deleted successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete club");
    }
  };

  const startEditing = (club) => {
    setEditingClub(club.id);
    setEditName(club.name);
    setEditDescription(club.description || "");
  };

  const cancelEditing = () => {
    setEditingClub(null);
    setEditName("");
    setEditDescription("");
  };

  const getRandomGradient = (id) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-purple-500 to-pink-600",
      "from-yellow-500 to-orange-600",
      "from-cyan-500 to-blue-600",
    ];
    return gradients[id % gradients.length];
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || 
                            (club.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Section */}
        <div className="relative mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 sm:w-10 sm:h-10" />
                <h1 className="text-2xl sm:text-4xl font-bold">Clubs</h1>
              </div>
              <p className="text-white/90 text-sm sm:text-base max-w-2xl">
                Join communities that match your interests, connect with like-minded people, 
                and participate in exciting activities and discussions.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                  <Award className="w-4 h-4" />
                  <span>{clubs.length}+ Clubs</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Club Toggle Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              showCreateForm
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? "Cancel" : "Create New Club"}
          </button>
        </div>

        {/* Create Club Form */}
        if (showCreateForm && (
          <div className="mb-8 animate-slideDown">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create New Club
                </h2>
              </div>
              <div className="p-5 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Club Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="e.g., Tech Enthusiasts, Book Lovers Club..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe what your club is about..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 resize-none transition-all"
                    />
                  </div>
                  <button
                    onClick={createClub}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search clubs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all"
            />
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const colorClasses = {
                blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                green: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
                orange: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
                purple: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
                indigo: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
                pink: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
              };
              const activeColorClasses = {
                blue: "bg-blue-500 text-white border-blue-500",
                green: "bg-green-500 text-white border-green-500",
                orange: "bg-orange-500 text-white border-orange-500",
                purple: "bg-purple-500 text-white border-purple-500",
                indigo: "bg-indigo-500 text-white border-indigo-500",
                pink: "bg-pink-500 text-white border-pink-500",
              };
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    selectedCategory === category.id
                      ? activeColorClasses[category.color]
                      : colorClasses[category.color]
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clubs Count */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            {filteredClubs.length} {filteredClubs.length === 1 ? "Club" : "Clubs"}
          </h2>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear search
            </button>
          )}
        </div>
        
        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No clubs found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {searchTerm ? "Try a different search term" : "Be the first to create a club!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map((club, index) => (
              <div 
                key={club.id} 
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                {editingClub === club.id ? (
                  <div className="p-5">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Club Name</label>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition"
                          placeholder="Club Name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 resize-none transition"
                          placeholder="Description"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => updateClub(club.id)}
                          className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all text-sm flex-1 justify-center"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm flex-1 justify-center"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Club Header with Gradient */}
                    <div className={`bg-gradient-to-r ${getRandomGradient(index)} p-4 sm:p-5 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                          {club.category === "academic" ? <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> :
                           club.category === "sports" ? <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> :
                           club.category === "arts" ? <Music className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> :
                           club.category === "tech" ? <Video className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> :
                           <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
                        </div>
                        <h3 className="font-bold text-white text-lg sm:text-xl truncate">{club.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Hash className="w-3 h-3 text-white/70" />
                          <span className="text-white/70 text-xs">ID: {club.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Club Body */}
                    <div className="p-4 sm:p-5">
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed min-h-[60px]">
                        {club.description || "No description provided yet."}
                      </p>
                      
                      {/* Member Stats */}
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{club.memberCount || 0} members</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        {joinedClubs.has(club.id) ? (
                          <button
                            onClick={() => leaveClub(club.id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center gap-1.5"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => joinClub(club.id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center justify-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Actions */}
                    {user && club.createdBy === user.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-3 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                        <button
                          onClick={() => startEditing(club)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition text-xs sm:text-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteClub(club.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 transition text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Crown className="w-3 h-3" />
                          <span>Owner</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}