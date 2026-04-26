import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadClubs = () => {
    api.get("/club/all").then((res) => setClubs(res.data));
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const createClub = async () => {
    await api.post("/club/create", { name, description });
    setName("");
    setDescription("");
    loadClubs();
  };

  const joinClub = async (id) => {
    await api.post("/club/join", { clubId: id });
    alert("Joined Successfully");
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Create Club</h2>

        <input
          placeholder="Club Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="mt-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={createClub} className="bg-blue-500 text-white mt-4">
          Create Club
        </button>
      </div>

      {clubs.map((club) => (
        <div key={club.id} className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold text-lg">{club.name}</h3>
          <p className="text-gray-500">{club.description}</p>

          <button
            onClick={() => joinClub(club.id)}
            className="bg-green-500 text-white mt-3"
          >
            Join Club
          </button>
        </div>
      ))}
    </div>
  );
}
