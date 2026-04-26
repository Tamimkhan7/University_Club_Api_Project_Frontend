import { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const nav = useNavigate();
  const { setToken } = useContext(AuthContext);

  const submit = async () => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data);
    setToken(res.data);

    nav("/");
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-5">Login</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        className="mt-3"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={submit} className="bg-blue-500 text-white w-full mt-5">
        Login
      </button>
    </div>
  );
}
