import { createContext, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Enhanced loading UI (only visual upgrade, logic unchanged)
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-red-950/20 dark:to-gray-900 flex items-center justify-center z-50">
        <div className="relative">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-full animate-ping" />
            <div className="absolute w-52 h-52 bg-gradient-to-r from-red-400/10 to-rose-400/10 rounded-full animate-pulse delay-75" />
            <div className="absolute w-40 h-40 bg-gradient-to-r from-red-300/10 to-rose-300/10 rounded-full animate-bounce" />
          </div>

          {/* Loading Card */}
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-500/10 p-8 min-w-[280px] border border-white/30 dark:border-gray-700/50 overflow-hidden">
            {/* Decorative Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 animate-shimmer" />
            
            {/* Animated Logo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/25">
                <Sparkles className="w-10 h-10 text-white animate-softSpin" />
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pingSlow" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Welcome to UniClub
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Initializing your experience...</p>
            </div>

            {/* Animated Progress Bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full animate-loadingBar" />
              </div>
            </div>

            {/* Animated Dots */}
            <div className="flex justify-center gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes softSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pingSlow {
            0% { transform: scale(1); opacity: 0.6; }
            75%, 100% { transform: scale(1.15); opacity: 0; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes loadingBar {
            0% { width: 10%; }
            50% { width: 60%; }
            100% { width: 90%; }
          }
          .animate-softSpin { animation: softSpin 2s linear infinite; }
          .animate-pingSlow { animation: pingSlow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
          .animate-shimmer { animation: shimmer 2s infinite; }
          .animate-loadingBar { animation: loadingBar 1.5s ease-in-out infinite alternate; }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}