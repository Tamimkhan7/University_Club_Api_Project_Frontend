import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    const verify = async () => {
      try {
        await api.get("/auth/verify-email", { params: { token } });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(getErrorMessage(err, "Invalid or expired verification link."));
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50 to-gray-50">
      <div className="w-full max-w-md">
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 text-center">
          {status === "verifying" && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-9 h-9 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Verifying your email...</h1>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
              <p className="text-gray-500 text-sm mb-6">Your account is ready. You can sign in now.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-red-500/25"
              >
                <Sparkles className="w-4 h-4" />
                Go to Sign In
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <Link to="/login" className="text-red-600 font-semibold hover:underline">
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
