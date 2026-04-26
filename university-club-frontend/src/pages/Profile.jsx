import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/user/profile").then((res) => setUser(res.data));
  }, []);

  return (
    <div className="bg-white p-6 shadow">
      <h2 className="text-xl">Profile</h2>

      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <p>{user?.bio}</p>
    </div>
  );
}