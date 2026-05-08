import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-red-950/20 dark:to-gray-900">
        <div className="relative">
          
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-full animate-ping" />
            <div className="absolute w-52 h-52 bg-gradient-to-r from-red-400/10 to-rose-400/10 rounded-full animate-pulse delay-75" />
            <div className="absolute w-40 h-40 bg-gradient-to-r from-red-300/10 to-rose-300/10 rounded-full animate-bounce" />
          </div>

          {/* Loading Card */}
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-500/10 p-8 min-w-[280px] border border-white/30 dark:border-gray-700/50 overflow-hidden">
            
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 animate-shimmer" />

            {/* Logo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-2xl opacity-40 animate-pulse" />

              <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-xl shadow-red-500/25">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVifde8HHEEoz6yz-nSHMKMMRNOeHfCE-GoA&s"
                  alt="PUCPC Logo"
                  className="w-full h-full object-cover animate-softSpin"
                />

                {/* Ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pingSlow" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Verifying Access
              </h3>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Please wait while we secure your session
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full animate-loadingBar" />
              </div>
            </div>

            {/* Dots */}
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
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pingSlow {
            0% {
              transform: scale(1);
              opacity: 0.6;
            }

            75%,
            100% {
              transform: scale(1.15);
              opacity: 0;
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(100%);
            }
          }

          @keyframes loadingBar {
            0% {
              width: 10%;
            }

            50% {
              width: 60%;
            }

            100% {
              width: 90%;
            }
          }

          .animate-softSpin {
            animation: softSpin 3s linear infinite;
          }

          .animate-pingSlow {
            animation: pingSlow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          .animate-loadingBar {
            animation: loadingBar 1.5s ease-in-out infinite alternate;
          }
        `}</style>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" />;

  return children;
}