import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Clubs() {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    api.get("/club/all").then((res) => setClubs(res.data));
  }, []);

  const join = async (id) => {
    await api.post("/club/join", { clubId: id });
    alert("Joined!");
  };

  return (
    <div className="space-y-3">
      {clubs.map((c) => (
        <div key={c.id} className="bg-white p-4 shadow">
          <h3>{c.name}</h3>
          <button onClick={() => join(c.id)} className="text-blue-500">
            Join
          </button>
        </div>
      ))}
    </div>
  );
}