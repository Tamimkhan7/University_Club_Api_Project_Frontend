import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { 
  Search, Users as UsersIcon, Sparkles, Mail, 
  MapPin, Calendar, Award, Heart, MessageCircle,
  Filter, X, ChevronRight, UserPlus, UserCheck,
  Star, TrendingUp, Shield, Crown
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
      searchUsers(search);
    } else {
      loadUsers();
    }
  }, [location]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/all");
      setUsers(res.data);
      applyFiltersAndSort(res.data, searchQuery, filterRole, sortBy);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    setLoading(true);
    try {
      const res = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
      setUsers(res.data);
      applyFiltersAndSort(res.data, query, filterRole, sortBy);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (userList, search, role, sort) => {
    let result = [...userList];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (role !== "all") {
      result = result.filter(user => user.role === role);
    }
    
    // Apply sorting
    if (sort === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === "oldest") {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    
    setFilteredUsers(result);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      loadUsers();
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setSortBy("name");
    loadUsers();
  };

  const getRandomGradient = (id) => {
    const gradients = [
      "from-red-500 to-rose-500",
      "from-rose-500 to-red-600",
      "from-red-600 to-rose-500",
      "from-rose-600 to-red-500",
      "from-red-500 to-orange-500",
      "from-rose-500 to-pink-500",
      "from-red-600 to-rose-600",
      "from-rose-500 to-red-500",
    ];
    return gradients[id % gradients.length];
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case "Admin":
        return { icon: Crown, text: "Admin", color: "from-yellow-500 to-orange-500", bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "Moderator":
        return { icon: Shield, text: "Moderator", color: "from-blue-500 to-cyan-500", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      default:
        return { icon: UserCheck, text: "Member", color: "from-green-500 to-emerald-500", bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-red-500/25">
              <UsersIcon className="w-10 h-10 text-white animate-spin-slow" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full animate-bounce flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">Loading community members...</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Connecting you with fellow students</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
        
        {/* Hero Section - Red Theme */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-20 left-20 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Community Members</h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">Connect with fellow university students</p>
                </div>
              </div>
              
              {/* Stats Badge */}
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 shadow-lg">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-semibold">{filteredUsers.length} Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar - Red Theme */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl shadow-red-500/10 p-4 sm:p-5 border border-white/30 dark:border-gray-700/50">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-white dark:bg-gray-900 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all duration-200 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-slideDown">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => {
                      setFilterRole(e.target.value);
                      applyFiltersAndSort(users, searchQuery, e.target.value, sortBy);
                    }}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-white dark:bg-gray-900 transition-all duration-200"
                  >
                    <option value="all">All Members</option>
                    <option value="Admin">Admins</option>
                    <option value="Moderator">Moderators</option>
                    <option value="Member">Members</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      applyFiltersAndSort(users, searchQuery, filterRole, e.target.value);
                    }}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-white dark:bg-gray-900 transition-all duration-200"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
              {(searchQuery || filterRole !== "all" || sortBy !== "name") && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <TrendingUp className="w-3 h-3 text-red-500" />
              <span>Active Community</span>
            </div>
          </div>
        )}

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-red-500/10 p-8 sm:p-12 text-center border border-white/30 dark:border-gray-700/50">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {searchQuery ? "No users found" : "No members yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? "Try a different search term" : "Invite friends to join the community"}
            </p>
            {searchQuery && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredUsers.map((user, index) => {
              const RoleIcon = getRoleBadge(user.role).icon;
              const roleBadge = getRoleBadge(user.role);
              const gradient = getRandomGradient(user.id);
              
              return (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`} 
                  className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/15 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-red-200/50 animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Cover Image with Gradient */}
                  <div className="relative">
                    <div className={`h-28 sm:h-32 bg-gradient-to-r ${gradient}`}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
                    </div>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&size=120&bold=true&length=2`}
                          alt={user.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-xl group-hover:scale-105 transition-transform duration-300 object-cover"
                        />
                        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className={`absolute top-3 right-3 ${roleBadge.bg} rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-medium shadow-sm`}>
                      <RoleIcon className="w-3 h-3" />
                      <span>{roleBadge.text}</span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="pt-14 sm:pt-16 pb-4 px-4 text-center">
                    <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-1">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    
                    {/* Department & Batch Tags */}
                    {(user.department || user.batch) && (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {user.department && (
                          <span className="text-[10px] px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">
                            {user.department}
                          </span>
                        )}
                        {user.batch && (
                          <span className="text-[10px] px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full font-medium">
                            Batch {user.batch}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Stats - with fallbacks */}
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span>{user.followerCount || user.followers || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-500" />
                        <span>{user.postCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span>{user.achievements || 0}</span>
                      </div>
                    </div>
                    
                    {/* Member Since */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}</span>
                      </div>
                    </div>
                    
                    {/* View Profile Button */}
                    <div className="mt-4">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 group-hover:gap-2 transition-all duration-200">
                        View Profile
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        {filteredUsers.length > 0 && (
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 sm:p-5 mt-6">
            <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <UsersIcon className="w-4 h-4 text-red-500" />
                <span>Total Members: {filteredUsers.length}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Active Community</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Growing Daily</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}