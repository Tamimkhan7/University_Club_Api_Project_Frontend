import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Menu,
  X,
  Home,
  Users,
  UserCircle,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Search,
  Bell,
  ChevronDown,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  User,
  MessageCircle,
  Heart,
  TrendingUp,
  Zap,
  BookOpen,
  Calendar,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/users?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/clubs", icon: Users, label: "Clubs" },
    { path: "/users", icon: UserCircle, label: "Users" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50 dark:border-gray-800/50"
            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100/50 dark:border-gray-800/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-[4.5rem]">
            {/* Logo with Red Theme */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden shadow-md shadow-red-500/25 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-red-500/30">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVifde8HHEEoz6yz-nSHMKMMRNOeHfCE-GoA&s"
                  alt="PUCPC Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent">
                PUCPC
              </span>
            </Link>
            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 bg-gray-100/80 dark:bg-gray-800/80 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-sm backdrop-blur-sm"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                </div>
              </form>
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-105"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {user ? (
                <>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`relative px-3.5 py-2 rounded-xl transition-all duration-300 ${
                          active
                            ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon
                            size={18}
                            className={active ? "text-red-500" : ""}
                          />
                          <span className="font-medium text-sm">
                            {link.label}
                          </span>
                        </div>
                        {active && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full" />
                        )}
                      </Link>
                    );
                  })}

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 ml-2 group"
                    >
                      <div className="relative">
                        <img
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&bold=true&length=2`
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500/30 group-hover:ring-red-500/50 transition-all duration-300"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50 animate-fadeInDown">
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-red-500/5 to-rose-500/5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                user.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&bold=true&length=2`
                              }
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/30"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 px-4 py-2 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="lg:hidden py-3 border-t border-gray-100 dark:border-gray-800 animate-slideDown">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-11 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all duration-200"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden py-4 space-y-1 border-t border-gray-100 dark:border-gray-800 animate-slideDown">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 p-3 mb-2 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-xl">
                    <img
                      src={
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&bold=true&length=2`
                      }
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center space-x-3 py-3 px-3 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full py-3 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3 p-3">
                  <Link
                    to="/login"
                    className="block text-center py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <div className="h-16 lg:h-[4.5rem]"></div>

      {/* Add animation keyframes to your global CSS or Tailwind config */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
