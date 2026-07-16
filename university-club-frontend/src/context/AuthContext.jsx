import { createContext, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }

    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      // Refresh/verify the current user from the server (GET /auth/me)
      // instead of blindly trusting whatever is cached in localStorage.
      api
        .get("/auth/me")
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        })
        .catch((error) => {
          console.error("Failed to refresh current user via /auth/me:", error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // login(accessToken, refreshToken, userObj)
  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  // Merge partial updates into the stored user (e.g. after profile edit)
  const updateUser = (partial) => {
    setUser((prev) => {
      const merged = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-red-950/20 dark:to-gray-900 flex items-center justify-center z-50">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-full animate-ping" />
          </div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-500/10 p-8 min-w-[280px] border border-white/30 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 animate-shimmer" />
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/25">
                <Sparkles className="w-10 h-10 text-white animate-softSpin" />
              </div>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Welcome to PUCPC
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Initializing your experience...</p>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes softSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .animate-softSpin { animation: softSpin 2s linear infinite; }
          .animate-shimmer { animation: shimmer 2s infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
