import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <div className="bg-white shadow px-8 py-4 flex justify-between">
      <div className="flex gap-5 font-semibold">
        <Link to="/">Feed</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <div>
        {token ? (
          <button onClick={logout} className="bg-red-500 text-white">
            Logout
          </button>
        ) : (
          <div className="flex gap-3">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}
