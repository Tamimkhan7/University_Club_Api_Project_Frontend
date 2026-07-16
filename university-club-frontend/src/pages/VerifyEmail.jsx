import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Sparkles, 
  MailCheck, 
  MailX, 
  MailQuestion,
  ArrowRight,
  Home,
  RefreshCw,
  Shield
} from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please check your email link.");
      return;
    }
    
    const verify = async () => {
      try {
        await api.get("/auth/verify-email", { params: { token } });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(getErrorMessage(err, "Invalid or expired verification link. Please request a new one."));
      }
    };
    
    verify();
  }, [token, retryCount]);

  const handleRetry = () => {
    setStatus("verifying");
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-200/20 dark:bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/20 dark:bg-rose-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-500/10 dark:shadow-red-500/5 p-8 sm:p-10 border border-white/30 dark:border-gray-700/30 text-center transition-all duration-500">
          
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-transparent rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Icon Section */}
            <div className="mb-6">
              {status === "verifying" && (
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30 dark:shadow-red-500/20">
                    <MailQuestion className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl animate-pulse opacity-20"></div>
                </div>
              )}

              {status === "success" && (
                <div className="relative inline-block animate-bounce-slow">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 dark:shadow-green-500/20">
                    <MailCheck className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-green-400/20 rounded-full blur-xl"></div>
                </div>
              )}

              {status === "error" && (
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30 dark:shadow-red-500/20">
                    <MailX className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Title & Message */}
            <div className="space-y-2 mb-6">
              {status === "verifying" && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    Verifying Your Email
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please wait while we confirm your email address
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </>
              )}

              {status === "success" && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    Email Verified! 🎉
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your account has been successfully verified
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Secure account confirmed</span>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    Verification Failed
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {message || "Something went wrong with the verification process"}
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === "success" && (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-red-500/25 dark:shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/35 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" />
                    Go to Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 w-full text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
                  >
                    <Home className="w-4 h-4" />
                    Return to Home
                  </Link>
                </>
              )}

              {status === "error" && (
                <>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-red-500/25 dark:shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/35 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-2xl font-semibold border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
                  >
                    Back to Sign In
                  </Link>
                </>
              )}

              {status === "verifying" && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    This may take a few seconds...
                  </p>
                </div>
              )}
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Secure verification process
                </span>
                <span className="hidden sm:inline mx-2">•</span>
                <span className="block sm:inline">
                  Powered by university authentication
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Card */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Having trouble? <Link to="/contact" className="text-red-500 hover:text-red-600 font-medium transition-colors">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}