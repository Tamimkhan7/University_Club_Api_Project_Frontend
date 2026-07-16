import { createContext, useState, useEffect } from "react";
import { Sparkles, Shield, Lock, User, CheckCircle, Zap, Heart, Star } from "lucide-react";
import api from "../api/axios";


export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const initializeAuth = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      const storedToken = localStorage.getItem("accessToken");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      const res = await api.get("/auth/me");

      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);
  const login = (accessToken, refreshToken, userData) => {
  localStorage.setItem("accessToken", accessToken);

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  localStorage.setItem("user", JSON.stringify(userData));

  setToken(accessToken);
  setUser(userData);
};

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

  window.location.href = "/login";
};

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-rose-50/50 to-orange-50/50 dark:from-gray-900 dark:via-red-950/20 dark:to-gray-900 flex items-center justify-center z-50 overflow-hidden">
        {/* Premium Background Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-full blur-2xl animate-spin-slow" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        {/* Main Loading Card */}
        <div className="relative max-w-sm w-full mx-4">
          <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-2xl animate-pulse-slow" />
          
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/20 dark:shadow-red-500/10 p-8 md:p-10 border border-white/30 dark:border-gray-700/50 transition-all duration-500">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-gradient-x rounded-t-3xl" />

            {/* Logo Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-full animate-ping-slow" />
                <div className="absolute w-24 h-24 bg-gradient-to-r from-red-400/10 to-rose-400/10 rounded-full animate-pulse-slow animation-delay-300" />
              </div>

              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-2xl opacity-30 animate-pulse-slow" />
                <div className="relative w-full h-full bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 border-2 border-white/20">
                  <Sparkles className="w-12 h-12 text-white animate-soft-spin" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                    <Star className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                Welcome to PUCPC
              </h3>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  Initializing your experience
                </p>
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce-dot" style={{ animationDelay: "0s" }} />
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce-dot" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex justify-center gap-4 mt-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                <Shield className="w-3 h-3 text-green-500" />
                <span>Secure</span>
              </div>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                <Lock className="w-3 h-3 text-blue-500" />
                <span>Encrypted</span>
              </div>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Verified</span>
              </div>
            </div>

            {/* Loading Progress */}
            <div className="mt-4">
              <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-gradient-x rounded-full animate-shimmer" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Global Styles for Animations */}
        <style>{`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes spin-slow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes soft-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.6; }
            75%, 100% { transform: scale(1.15); opacity: 0; }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes bounce-dot {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
            background-size: 200% 100%;
          }
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 30s linear infinite;
          }
          .animate-soft-spin {
            animation: soft-spin 2s linear infinite;
          }
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          .animate-bounce-dot {
            animation: bounce-dot 0.8s ease-in-out infinite;
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
          .animation-delay-1000 {
            animation-delay: 1s;
          }
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