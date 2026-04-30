import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { Search, Users as UsersIcon, Sparkles } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
      const res = await api.get("/users/all");
      setUsers(res.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      loadUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <UsersIcon className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-500 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <UsersIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Community Members
        </h1>
        <p className="text-slate-500 mt-2">Connect with fellow university students</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-lg text-sm">
            Search
          </button>
        </div>
      </form>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700">{searchQuery ? "No users found" : "No users yet"}</h3>
          <p className="text-slate-500 mt-2">{searchQuery ? "Try a different search term" : "Invite friends to join the community"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => (
            <Link key={user.id} to={`/profile/${user.id}`} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition group overflow-hidden">
              <div className="relative">
                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff&size=100&bold=true`}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition"
                  />
                </div>
              </div>
              <div className="pt-14 pb-4 px-4 text-center">
                <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{user.email}</p>
                {(user.department || user.batch) && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {user.department && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">{user.department}</span>}
                    {user.batch && <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">Batch {user.batch}</span>}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}