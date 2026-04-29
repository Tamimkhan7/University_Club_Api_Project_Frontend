import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Home, Users, UserCircle, LogOut, Sparkles } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              UniClub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition font-medium">
                  <Home size={18} />
                  <span>Feed</span>
                </Link>
                <Link to="/clubs" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition font-medium">
                  <Users size={18} />
                  <span>Clubs</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition font-medium">
                  <UserCircle size={18} />
                  <span>Profile</span>
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-200">
                  <div className="relative group">
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff&bold=true`}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition"
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-slate-600 hover:text-blue-600 transition font-medium px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="gradient-bg text-white px-5 py-2 rounded-xl hover:shadow-lg transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-100 animate-fadeIn">
            {user ? (
              <>
                <Link to="/" className="flex items-center space-x-3 py-3 px-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>
                  <Home size={18} />
                  <span>Feed</span>
                </Link>
                <Link to="/clubs" className="flex items-center space-x-3 py-3 px-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>
                  <Users size={18} />
                  <span>Clubs</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-3 py-3 px-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>
                  <UserCircle size={18} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center space-x-3 w-full py-3 px-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-3 px-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block py-3 px-2 gradient-bg text-white rounded-lg text-center" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}