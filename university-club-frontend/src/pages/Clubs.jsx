import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { Edit3, Trash2, Users, Plus, X, Check } from "lucide-react";

export default function Clubs() {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingClub, setEditingClub] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadClubs = async () => {
    setLoading(true);
    try {
      // API: GET /api/club/all
      const allClubsRes = await api.get("/club/all");
      setClubs(allClubsRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClubs();
  }, []);

  // API: POST /api/club/create
  const createClub = async () => {
    if (!name.trim()) {
      alert("Please enter club name");
      return;
    }
    
    try {
      await api.post("/club/create", { name, description });
      setName("");
      setDescription("");
      loadClubs();
      alert("Club created successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create club");
    }
  };

  // API: POST /api/club/join
  const joinClub = async (clubId) => {
    try {
      await api.post("/club/join", { clubId });
      alert("Joined club successfully!");
      loadClubs();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Already joined or error occurred");
    }
  };

  // API: DELETE /api/club/leave/{clubId}
  const leaveClub = async (clubId) => {
    try {
      await api.delete(`/club/leave/${clubId}`);
      alert("Left club successfully!");
      loadClubs();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to leave club");
    }
  };

  // API: PUT /api/club/update/{id}
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
      alert("Club updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update club");
    }
  };

  // API: DELETE /api/club/delete/{id}
  const deleteClub = async (clubId) => {
    if (!confirm("Are you sure you want to delete this club? All posts will also be deleted!")) return;
    
    try {
      await api.delete(`/club/delete/${clubId}`);
      loadClubs();
      alert("Club deleted successfully!");
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Create Club Form */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="gradient-bg px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Club
          </h2>
        </div>
        <div className="p-6">
          <input
            placeholder="Club Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="mb-4 resize-none"
          />
          <button
            onClick={createClub}
            className="gradient-bg text-white px-6 py-2 rounded-xl hover:shadow-lg transition w-full md:w-auto"
          >
            ✨ Create Club
          </button>
        </div>
      </div>

      {/* Clubs List */}
      <h2 className="text-2xl font-bold text-slate-800 mt-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-500" />
        All Clubs
      </h2>
      
      {clubs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700">No clubs yet</h3>
          <p className="text-slate-500 mt-2">Be the first to create a club!</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {editingClub === club.id ? (
                <div className="p-5">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mb-3 font-bold text-xl"
                    placeholder="Club Name"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows="3"
                    className="mb-3 resize-none"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateClub(club.id)}
                      className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-slate-800">{club.name}</h3>
                    <p className="text-slate-600 mt-2">{club.description || "No description"}</p>
                    <p className="text-xs text-slate-400 mt-2">Club ID: {club.id}</p>
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => joinClub(club.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm flex items-center gap-1"
                      >
                        📝 Join
                      </button>
                      <button
                        onClick={() => leaveClub(club.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm flex items-center gap-1"
                      >
                        🚪 Leave
                      </button>
                    </div>
                  </div>
                  
                  {user && club.createdBy === user.id && (
                    <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 flex gap-3">
                      <button
                        onClick={() => startEditing(club)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClub(club.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}