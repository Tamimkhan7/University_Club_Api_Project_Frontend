import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { 
  Mail, MailCheck, AlertCircle, Loader2, KeyRound, 
  Shield, Lock, CheckCircle, Sparkles, ArrowLeft,
  Rocket, Heart, Star, Crown, Award
} from "lucide-react";

/**
 * ============================================================
 *  🔐 ForgotPassword — Premium Password Reset Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Send password reset link to user's email   │
 *  │  🔥 Features: Email validation, Loading state          │
 *  │  📱 Responsive: Optimized for all screen sizes          │
 *  └─────────────────────────────────────────────────────────────┘
 * 
 *  ⚡ Flow:
 *  1. User enters email
 *  2. Sends reset link via API
 *  3. Shows success state
 *  4. Redirects to login
 */

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send reset link"));
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
                <KeyRound className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
              {sent 
                ? "We've sent a reset link to your email" 
                : "Enter your email and we'll send you a password reset link"}
            </p>

            {sent ? (
              /* Success State */
              <div className="mt-8 animate-slideDown">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full animate-ping-slow" />
                  </div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                    <MailCheck className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50/80 dark:bg-green-950/20 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-800/30">
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    ✨ Reset link sent successfully!
                  </p>
                  <p className="text-green-600/70 dark:text-green-400/70 text-xs mt-1">
                    If an account exists, you'll receive the email shortly.
                  </p>
                </div>

                <button
                  onClick={() => window.location.href = "/login"}
                  className="mt-6 w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </div>
            ) : (
              /* Form State */
              <div className="mt-8">
                {error && (
                  <div className="mb-5 p-4 bg-red-50/90 dark:bg-red-950/20 backdrop-blur-sm border border-red-200 dark:border-red-800/30 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-start gap-3 text-left animate-shake">
                    <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <span className="font-semibold block">Oops!</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center text-[10px] font-mono text-gray-400">
                        @
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-[length:200%_100%] animate-gradient-x text-white py-3.5 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                {/* Security Badges */}
                <div className="mt-6 flex justify-center items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-green-500" />
                    <span>Secure</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center gap-3">
              <Link
                to="/login"
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-sm font-medium flex items-center gap-1.5 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Sign In
              </Link>
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-red-400" />
                Secure password recovery
              </p>
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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(1.15); opacity: 0; }
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
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
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