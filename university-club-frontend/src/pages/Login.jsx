import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { 
  Mail, Lock, LogIn, Sparkles, Eye, EyeOff, AlertCircle, ArrowRight,
  Shield, CheckCircle, Heart, Star, Crown, Award, Rocket,
  Globe, Users, MessageCircle, Zap
} from "lucide-react";

/**
 * ============================================================
 *  🔐 Login — Premium Authentication Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Authenticate users with email & password   │
 *  │  🔥 Features: Password toggle, Error handling           │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 * 
 *  ⚡ Flow:
 *  1. User enters email and password
 *  2. Validates credentials via API
 *  3. Stores tokens and user data
 *  4. Redirects to home page
 */

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      const { accessToken, refreshToken, user } = response.data || {};

      if (accessToken) {
        login(accessToken, refreshToken, user);
        navigate("/");
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 overflow-hidden">
      
      {/* Premium Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-full blur-2xl animate-spin-slow" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Outer Glow Ring */}
        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-2xl animate-pulse-slow" />
        
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/20 dark:shadow-red-500/10 p-8 md:p-10 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/25">
          
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-gradient-x rounded-t-3xl" />

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-2xl" />

          <div className="relative text-center">
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 transform hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Sign in to continue your journey with PUCPC
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50/90 dark:bg-red-950/20 backdrop-blur-sm border border-red-200 dark:border-red-800/30 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-start gap-3 text-left animate-shake">
                <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="font-semibold block">Authentication Error</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center text-[10px] font-mono text-gray-400">
                    @
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                  <label htmlFor="remember" className="text-gray-500 dark:text-gray-400">Remember me</label>
                </div>
                <Link to="/forgot-password" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-[length:200%_100%] animate-gradient-x text-white py-3.5 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 dark:bg-gray-800/90 text-gray-400 dark:text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-600 transition-colors">Facebook</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#DB4437">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-600 transition-colors">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-600 transition-colors">GitHub</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 transition-colors hover:underline underline-offset-2 inline-flex items-center gap-1 group">
                  Create Account
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Secure Login</span>
                </div>
                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>PUCPC Community</span>
                </div>
              </div>
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
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
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
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}