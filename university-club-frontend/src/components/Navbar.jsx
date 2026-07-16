import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
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
  Sun,
  Moon,
  User,
  Calendar,
  MessageSquare,
  FolderOpen,
  UsersRound,
  Link2,
  Award,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  useEffect(() => {
    if (!user) return;
    const loadCounts = async () => {
      try {
        const [notifRes, msgRes] = await Promise.all([
          api.get("/notification/count"),
          api.get("/message/unread-count"),
        ]);
        setUnreadNotifs(
          notifRes.data?.data?.unreadCount ?? notifRes.data?.unreadCount ?? 0,
        );
        setUnreadMessages(
          msgRes.data?.data?.unreadCount ?? msgRes.data?.unreadCount ?? 0,
        );
      } catch {
        /* ignore */
      }
    };
    loadCounts();
    const interval = setInterval(loadCounts, 15000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

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

const isActive = (path) =>    location.pathname === path ||    location.pathname.startsWith(path + "/");
  const navLinks = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/clubs", icon: Users, label: "Clubs" },
    { path: "/events", icon: Calendar, label: "Events" },
    { path: "/users", icon: UserCircle, label: "Users" },
  ];

  // Fixed: Removed unused imports (Heart, Zap, Shield, Award) and added mobile nav items with unique keys
  const mobileNavItems = [
    ...navLinks,
    { path: "/messages", icon: MessageSquare, label: "Messages" },
    { path: "/groups", icon: UsersRound, label: "Group Chats" },
    { path: "/files", icon: FolderOpen, label: "Files" },
    { path: "/connections", icon: Link2, label: "Connections" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl border-b border-gray-200/50 dark:border-gray-800/50"
            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50"
        }`}
      >
        {/* Premium Animated Gradient Border */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 via-rose-500/50 to-transparent animate-slide-right" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-[4.5rem]">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-2xl overflow-hidden shadow-lg shadow-red-500/25 group-hover:shadow-2xl group-hover:shadow-red-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVifde8HHEEoz6yz-nSHMKMMRNOeHfCE-GoA&s"
                    alt="PUCPC Logo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-pulse">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent tracking-tight">
                  PUCPC
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 -mt-0.5 tracking-wider uppercase">
                  Community
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 bg-gray-100/80 dark:bg-gray-800/80 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-400/20 focus:border-red-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-sm backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1.5">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                )}
              </button>

              {user ? (
                <>
                  {/* Navigation Links */}
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`relative px-3.5 py-2 rounded-xl transition-all duration-300 ${
                          active
                            ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400 shadow-sm"
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
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Messages */}
                  <Link
                    to="/messages"
                    className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group"
                  >
                    <MessageSquare
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group"
                  >
                    <Bell
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                        {unreadNotifs > 9 ? "9+" : unreadNotifs}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 ml-1 group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                        <img
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&bold=true&length=2`
                          }
                          alt={user.name}
                          className="relative w-9 h-9 rounded-full object-cover ring-2 ring-red-500/30 group-hover:ring-red-500/50 transition-all duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-lg shadow-green-500/30" />
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                          showUserMenu ? "rotate-180 text-red-500" : ""
                        }`}
                      />
                    </button>

                    {showUserMenu && (
                      <>
                        <div className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50 animate-slideDown">
                          {/* User Header */}
                          <div className="relative p-5 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-500/10 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <img
                                  src={
                                    user.profileImage ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&bold=true&length=2`
                                  }
                                  alt={user.name}
                                  className="w-14 h-14 rounded-full object-cover ring-2 ring-red-500/30 shadow-lg"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Shield className="w-3 h-3 text-amber-500" />
                                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                    Verified Member
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                            to={`/profile/${user.id}`}
                              className="flex items-center space-x-3 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all">
                                <User className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                              </div>
                              <span className="font-medium">My Profile</span>
                            </Link>
                            <Link
                              to="/groups"
                              className="flex items-center space-x-3 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all">
                                <UsersRound className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                              </div>
                              <span className="font-medium">Group Chats</span>
                            </Link>
                            <Link
                              to="/files"
                              className="flex items-center space-x-3 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all">
                                <FolderOpen className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                              </div>
                              <span className="font-medium">Files</span>
                            </Link>
                            <Link
                              to="/connections"
                              className="flex items-center space-x-3 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all">
                                <Link2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                              </div>
                              <span className="font-medium">Connections</span>
                            </Link>
                            <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-1.5" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 w-full px-5 py-2.5 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all">
                                <LogOut className="w-4 h-4 text-red-500" />
                              </div>
                              <span className="font-medium">Logout</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2 rounded-xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-1 lg:hidden">
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
                {isOpen ? (
                  <X size={24} className="text-red-500" />
                ) : (
                  <Menu size={24} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="lg:hidden py-3 border-t border-gray-100 dark:border-gray-800 animate-slideDown">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-11 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}

          {/* Mobile Menu - Fixed: Used proper key and removed duplicate entries */}
          {isOpen && (
            <div className="lg:hidden py-4 space-y-1 border-t border-gray-100 dark:border-gray-800 animate-slideDown">
              {user ? (
                <>           
                  <div className="flex items-center space-x-4 p-4 mb-3 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-2xl border border-red-500/10">
                    <img
                      src={
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&bold=true&length=2`
                      }
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-red-500/30"
                    />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          Active Member
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links - Fixed: Using mobileNavItems with unique keys */}
                  {mobileNavItems.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon
                          size={20}
                          className={active ? "text-red-500" : ""}
                        />
                        <span className="font-medium">{link.label}</span>
                        {link.path === "/messages" && unreadMessages > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadMessages}
                          </span>
                        )}
                        {link.path === "/notifications" && unreadNotifs > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadNotifs}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2" />

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-3 w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full py-3 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 mt-1"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3 p-3">
                  <Link
                    to="/login"
                    className="block text-center py-3.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 font-medium"
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
      <div className="h-16 lg:h-[4.5rem]" />

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(100%); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slideRight {
          animation: slideRight 3s ease-in-out infinite;
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
