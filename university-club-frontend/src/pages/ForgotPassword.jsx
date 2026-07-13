import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { Mail, MailCheck, AlertCircle, Loader2, KeyRound } from "lucide-react";

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50 to-gray-50">
      <div className="w-full max-w-md">
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-red-500/20">
            <KeyRound className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h1>

          {sent ? (
            <>
              <MailCheck className="w-10 h-10 text-green-500 mx-auto my-4" />
              <p className="text-gray-500 text-sm mb-6">
                If an account with that email exists, a reset link has been sent.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we'll send you a password reset link.
              </p>
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  Send Reset Link
                </button>
              </form>
            </>
          )}

          <p className="text-center text-gray-500 text-sm mt-8">
            <Link to="/login" className="text-red-600 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
