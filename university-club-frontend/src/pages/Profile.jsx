import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState({});
  const [edit, setEdit] = useState({});

  const loadProfile = () => {
    api.get("/user/profile").then((res) => {
      setUser(res.data);
      setEdit(res.data);
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const update = async () => {
    await api.put("/user/update", edit);
    alert("Profile Updated");
    loadProfile();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-5">My Profile</h2>

      <input
        value={edit.name || ""}
        onChange={(e) => setEdit({ ...edit, name: e.target.value })}
      />

      <input
        className="mt-3"
        value={edit.bio || ""}
        placeholder="Bio"
        onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
      />

      <input
        className="mt-3"
        value={edit.department || ""}
        placeholder="Department"
        onChange={(e) => setEdit({ ...edit, department: e.target.value })}
      />

      <input
        className="mt-3"
        value={edit.batch || ""}
        placeholder="Batch"
        onChange={(e) => setEdit({ ...edit, batch: e.target.value })}
      />

      <button onClick={update} className="bg-blue-500 text-white mt-5">
        Update Profile
      </button>
    </div>
  );
}
