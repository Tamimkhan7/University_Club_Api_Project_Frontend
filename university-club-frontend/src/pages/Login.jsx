import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

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

      // Real backend shape: { accessToken, refreshToken, user: { id, name, email, role } }
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50 to-gray-50">
      <div className="w-full max-w-md">
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-gray-500/5 pointer-events-none" />
          <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full" />
          <div className="absolute bottom-0 right-0 w-48 h-1 bg-gradient-to-l from-red-500 to-rose-500 rounded-full" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-rose-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-red-500/20 group hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-9 h-9 text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to continue to PUCPC</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-3 animate-shake">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-xs text-red-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8 relative">
            Don't have an account?{" "}
            <Link to="/register" className="text-red-600 font-semibold hover:text-red-700 transition-colors duration-200 hover:underline underline-offset-2">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
