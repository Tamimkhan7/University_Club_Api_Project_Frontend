import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import BackgroundDecoration from "../components/BackgroundDecoration";
import { 
  Mail, MailCheck, AlertCircle, Loader2, KeyRound, 
  Shield, Lock, CheckCircle, Sparkles, ArrowLeft,
  Rocket, Heart, Star, Crown, Award
} from "lucide-react";

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 overflow-hidden">
      
      <BackgroundDecoration variant="auth" />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-2xl animate-pulse-slow" />
        
        <div className="relative glass-card rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/25">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer rounded-t-3xl" />

          <div className="relative text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 transform hover:scale-110 transition-transform duration-500">
                <KeyRound className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
              {sent 
                ? "We've sent a reset link to your email" 
                : "Enter your email and we'll send you a password reset link"}
            </p>

            {sent ? (
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

                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center justify-center gap-2 btn-primary w-full group"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
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
                      className="input-premium pl-12 pr-4"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 group"
                  >
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

            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-sm font-medium group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Sign In
              </Link>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>Secure recovery</span>
                </div>
                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>PUCPC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}