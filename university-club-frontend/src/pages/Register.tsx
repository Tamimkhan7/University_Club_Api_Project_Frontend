import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { 
  User, Mail, Lock, UserPlus, Sparkles, Eye, EyeOff, 
  AlertCircle, CheckCircle, MailCheck, Shield, Heart,
  Star, Award, Rocket, Zap, Crown, Gem, BadgeCheck,
  ArrowRight, Check, X, Loader2, PartyPopper
} from "lucide-react";

/**
 * ============================================================
 *  ✨ Register — Premium Registration Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Create new user account                    │
 *  │  🔥 Features: Password validation, Email verification  │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 * 
 *  ⚡ Flow:
 *  1. User fills registration form
 *  2. Validates inputs
 *  3. Sends registration request
 *  4. Shows email verification success
 *  5. Redirects to login
 */

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (!form.password) return setError("Password is required");
    const pwdError = validatePassword(form.password);
    if (pwdError) return setError(pwdError);
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 overflow-hidden">
        
        {/* Premium Background Decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-2xl animate-spin-slow" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-2xl animate-pulse-slow" />
          
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-green-500/20 dark:shadow-green-500/10 p-8 md:p-10 border border-gray-200/50 dark:border-gray-700/50 text-center transition-all duration-500 hover:shadow-3xl hover:shadow-green-500/25">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-[length:200%_100%] animate-gradient-x rounded-t-3xl" />

            <div className="relative">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30 transform hover:scale-110 transition-transform duration-500">
                  <MailCheck className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                    <PartyPopper className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Check Your Email!
              </h1>
              
              <div className="mt-4 p-5 bg-green-50/80 dark:bg-green-950/20 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-800/30">
                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                  ✨ Verification link sent successfully!
                </p>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm mt-2 leading-relaxed">
                  We've sent a verification link to <br />
                  <span className="font-bold text-green-800 dark:text-green-300">{form.email}</span>
                </p>
                <p className="text-xs text-green-600/60 dark:text-green-400/60 mt-3">
                  Please verify your email before signing in
                </p>
              </div>

              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 transition-all duration-300 hover:scale-[1.02] w-full group"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                <span>Secure verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Join the university community
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50/90 dark:bg-red-950/20 backdrop-blur-sm border border-red-200 dark:border-red-800/30 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-start gap-3 text-left animate-shake">
                <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="font-semibold block">Registration Error</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center text-[10px] font-mono text-gray-400">
                    ✨
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password (min 6 characters)"
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

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm Password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Password must be at least 6 characters</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-[length:200%_100%] animate-gradient-x text-white py-3.5 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <Rocket className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    <span>Create Account</span>
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
                <span className="px-4 bg-white/90 dark:bg-gray-800/90 text-gray-400 dark:text-gray-500">Already a member?</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 transition-colors hover:underline underline-offset-2 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Secure Registration</span>
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