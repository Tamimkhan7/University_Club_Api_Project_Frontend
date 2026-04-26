import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const login = async () => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data);
    nav("/");
  };

  return (
    <div className="bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4">Login</h2>

      <input className="border p-2 w-full mb-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={login} className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
    </div>
  );
}