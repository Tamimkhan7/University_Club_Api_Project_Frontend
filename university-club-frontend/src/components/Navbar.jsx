import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  Menu, X, Home, Users, UserCircle, LogOut, Sparkles, 
  LayoutDashboard, Search, Bell, ChevronDown, Settings, 
  HelpCircle, Sun, Moon, User, MessageCircle, Heart,
  TrendingUp, Zap, BookOpen, Calendar
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-800" 
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-[4.5rem]">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="relative w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                UniClub
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-11 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-3 py-2 rounded-xl transition ${
                          isActive(link.path)
                            ? "bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon size={18} />
                          <span className="font-medium text-sm">{link.label}</span>
                        </div>
                      </Link>
                    );
                  })}

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 ml-2"
                    >
                      <img
                        src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&bold=true&length=2`}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
                      />
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&bold=true&length=2`}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                  <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 px-4 py-2">Sign In</Link>
                  <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-xl hover:shadow-lg">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="lg:hidden py-3 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </form>
            </div>
          )}

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden py-4 space-y-1 border-t border-gray-100 dark:border-gray-800">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 p-3 mb-2 bg-gradient-to-r from-blue-500/5 to-purple-600/5 rounded-xl">
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&bold=true&length=2`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center space-x-3 py-3 px-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 rounded-xl"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full py-3 px-3 text-red-600 hover:bg-red-50 rounded-xl mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3 p-3">
                  <Link to="/login" className="block text-center py-3 text-gray-600 hover:bg-gray-50 rounded-xl" onClick={() => setIsOpen(false)}>Sign In</Link>
                  <Link to="/register" className="block text-center py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl" onClick={() => setIsOpen(false)}>Get Started</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <div className="h-16 lg:h-[4.5rem]"></div>
    </>
  );
}