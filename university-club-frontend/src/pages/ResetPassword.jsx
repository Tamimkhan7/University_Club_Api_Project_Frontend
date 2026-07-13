import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) return setError("Missing reset token. Use the link from your email.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to reset password"));
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h1>

          {success ? (
            <>
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto my-4" />
              <p className="text-gray-500 text-sm">Password reset! Redirecting to sign in...</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">Choose a new password for your account.</p>
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full pl-12 pr-12 py-3.5 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                  Reset Password
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
