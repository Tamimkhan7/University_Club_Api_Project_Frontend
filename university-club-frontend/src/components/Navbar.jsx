import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api, { toArray } from "../api/axios";
import searchApi, { SearchEntityType } from "../api/search";
import clubPrivacyApi from "../api/clubPrivacy";
import Logo from "./Logo";
import {
  Menu,
  X,
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
  Shield,
  Crown,
  Compass,
  ClipboardList,
  Mail,
  Trophy,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimerRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingInvites, setPendingInvites] = useState(0);
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
      const [notifRes, msgRes, invitesRes] = await Promise.allSettled([
        api.get("/notification/count"),
        api.get("/message/unread-count"),
        clubPrivacyApi.getMyInvites(),
      ]);
      if (notifRes.status === "fulfilled") setUnreadNotifs(notifRes.value.data?.unreadCount ?? 0);
      if (msgRes.status === "fulfilled") setUnreadMessages(msgRes.value.data?.unreadCount ?? 0);
      if (invitesRes.status === "fulfilled") setPendingInvites(toArray(invitesRes.value).length);
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
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setShowSuggestions(false);
      setSearchQuery("");
      setIsOpen(false);
    }
  };


  const handleSearchInput = (val) => {
    setSearchQuery(val);
    setShowSuggestions(true);
    clearTimeout(suggestTimerRef.current);
    if (!val.trim()) {
      setSearchSuggestions([]);
      return;
    }
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const data = await searchApi.getSuggestions(val.trim(), 6);
        setSearchSuggestions(data || []);
      } catch {
        setSearchSuggestions([]);
      }
    }, 250);
  };

  const handleSuggestionClick = (s) => {
    setShowSuggestions(false);
    setShowSearch(false);
    setSearchQuery("");
    setIsOpen(false);
    if (s.type === SearchEntityType.Users) navigate(`/profile/${s.id}`);
    else if (s.type === SearchEntityType.Clubs) navigate(`/clubs/${s.id}`);
    else navigate(`/search?query=${encodeURIComponent(s.label)}`);
  };

  const renderSuggestionsDropdown = () =>
    showSuggestions && searchSuggestions.length > 0 && (
      <div className="absolute z-50 mt-2 w-full bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-slideDown">
        {searchSuggestions.map((s) => {
          const Icon = s.type === SearchEntityType.Users ? UserCircle : Users;
          return (
            <button
              type="button"
              key={`${s.type}-${s.id}`}
              onMouseDown={() => handleSuggestionClick(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors"
            >
              <Icon className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-slate-200 truncate">{s.label}</span>
              <span className="text-[10px] text-slate-500 ml-auto uppercase tracking-wide">{s.type}</span>
            </button>
          );
        })}
      </div>
    );

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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = [
    { path: "/", label: "Feed" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/clubs", label: "Clubs" },
    { path: "/events", label: "Events" },
    { path: "/recommendations", label: "AI Recommended" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/users", label: "Users" },
  ];

  const mobileNavItems = [
    ...navLinks,
    { path: "/messages", label: "Messages" },
    { path: "/groups", label: "Group Chats" },
    { path: "/files", label: "Files" },
    { path: "/connections", label: "Connections" },
    { path: "/applications", label: "My Applications" },
    { path: "/invites", label: "My Invites" },
    { path: "/notifications", label: "Notifications" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-black/30 border-white/5"
            : "bg-slate-950/90 backdrop-blur-xl border-white/5"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-shimmer opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-[4.25rem]">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                <Logo
                  size={40}
                  className="relative shadow-lg shadow-red-500/25 group-hover:shadow-xl group-hover:shadow-red-500/40 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3"
                />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-pulse">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-display font-bold bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent tracking-tight leading-none">
                  PUCPC
                </span>
                <span className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-[0.2em] uppercase">
                  Community
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-red-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users, clubs, posts..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full px-4 py-2.5 pl-11 bg-white/5 border-2 border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-400/10 focus:border-red-400/40 focus:bg-white/10 transition-all duration-300 text-sm backdrop-blur-sm placeholder-slate-400 text-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 rounded-md border border-white/10">
                      ⌘K
                    </kbd>
                  </div>
                </div>
                {renderSuggestionsDropdown()}
              </form>
            </div>

        
            <div className="hidden lg:flex items-center space-x-1.5">
              <button
                onClick={toggleDarkMode}
                className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
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
                        className={`nav-link ${active ? "nav-link-active" : "nav-link-inactive"}`}
                      >
                        {Icon && <Icon size={18} className={active ? "text-red-400" : ""} />}
                        <span>{link.label}</span>
                        {active && (
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-red-400 to-amber-400 rounded-full" />
                        )}
                      </Link>
                    );
                  })}

                  <Link
                    to="/messages"
                    className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
                  >
                    <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/notifications"
                    className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
                  >
                    <Bell size={20} className="group-hover:scale-110 transition-transform" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                        {unreadNotifs > 9 ? "9+" : unreadNotifs}
                      </span>
                    )}
                  </Link>

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 ml-1 group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                        <img
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e11d48&color=fff&bold=true&length=2`
                          }
                          alt={user.name}
                          className="relative w-9 h-9 rounded-full object-cover ring-2 ring-red-400/40 group-hover:ring-red-400/70 transition-all duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-950 shadow-lg shadow-green-500/30" />
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-all duration-300 ${
                          showUserMenu ? "rotate-180 text-red-400" : ""
                        }`}
                      />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden z-50 animate-slideDown">
                        <div className="relative p-5 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-amber-500/10 border-b border-white/10">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                src={
                                  user.profileImage ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e11d48&color=fff&bold=true&length=2`
                                }
                                alt={user.name}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-red-400/40 shadow-lg"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-300 truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Shield className="w-3 h-3 text-amber-400" />
                                <span className="text-[10px] font-medium text-amber-400">
                                  Verified Member
                                </span>
                                <Crown className="w-3 h-3 text-amber-300 ml-1" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to={`/profile/${user.id}`}
                            className="flex items-center space-x-3 px-5 py-2.5 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <User className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                            </div>
                            <span className="font-medium">My Profile</span>
                          </Link>
                          <Link
                            to="/groups"
                            className="flex items-center space-x-3 px-5 py-2.5 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <UsersRound className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                            </div>
                            <span className="font-medium">Group Chats</span>
                          </Link>
                          <Link
                            to="/files"
                            className="flex items-center space-x-3 px-5 py-2.5 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <FolderOpen className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                            </div>
                            <span className="font-medium">Files</span>
                          </Link>
                          <Link
                            to="/connections"
                            className="flex items-center space-x-3 px-5 py-2.5 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <Link2 className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                            </div>
                            <span className="font-medium">Connections</span>
                          </Link>
                          <Link
                            to="/applications"
                            className="flex items-center space-x-3 px-5 py-2.5 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <ClipboardList className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                            </div>
                            <span className="font-medium">My Applications</span>
                          </Link>
                          <Link
                            to="/invites"
                            className="flex items-center space-x-3 px-5 py-2.5 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <Mail className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                            </div>
                            <span className="font-medium">My Invites</span>
                            {pendingInvites > 0 && (
                              <span className="ml-auto bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {pendingInvites > 9 ? "9+" : pendingInvites}
                              </span>
                            )}
                          </Link>
                          <div className="border-t border-white/10 my-1.5" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-5 py-2.5 text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                              <LogOut className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="text-slate-200 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary px-5 py-2"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

       
            <div className="flex items-center space-x-1 lg:hidden">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X size={24} className="text-red-400" />
                ) : (
                  <Menu size={24} />
                )}
              </button>
            </div>
          </div>


          {showSearch && (
            <div className="lg:hidden py-3 border-t border-white/5 animate-slideDown">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users, clubs, posts..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full px-4 py-3 pl-11 bg-white/5 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white/10 transition-all duration-200 placeholder-slate-400"
                    autoFocus
                  />
                </div>
                {renderSuggestionsDropdown()}
              </form>
            </div>
          )}


          {isOpen && (
            <div className="lg:hidden py-4 space-y-1 border-t border-white/5 animate-slideDown">
              {user ? (
                <>
                  <div className="flex items-center space-x-4 p-4 mb-3 bg-gradient-to-r from-red-500/10 to-amber-500/10 rounded-2xl border border-white/10">
                    <img
                      src={
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e11d48&color=fff&bold=true&length=2`
                      }
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-red-400/40"
                    />
                    <div>
                      <p className="font-bold text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-300 truncate max-w-[200px]">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-medium text-amber-400">
                          Active Member
                        </span>
                      </div>
                    </div>
                  </div>

                  {mobileNavItems.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {Icon && <Icon size={20} className={active ? "text-red-400" : ""} />}
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
                        {link.path === "/invites" && pendingInvites > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pendingInvites}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <div className="border-t border-white/10 my-2" />

                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-3 w-full py-3 px-4 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200"
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
                    className="flex items-center space-x-3 w-full py-3 px-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 mt-1"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3 p-3">
                  <Link
                    to="/login"
                    className="block text-center py-3.5 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-3.5 btn-primary"
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
      <div className="h-16 lg:h-[4.25rem]" />
    </>
  );
}