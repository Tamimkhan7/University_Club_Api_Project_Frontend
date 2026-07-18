import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function Loader() {
  const [loadingText, setLoadingText] = useState("Loading");
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const texts = ["Loading", "Fetching data", "Preparing content", "Almost there", "Finalizing"];
    let index = 0;
    const textInterval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 1500);
    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 flex items-center justify-center z-50 overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-full blur-2xl animate-spin-slow" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent animate-shimmer" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent animate-shimmer" />
      </div>

      <div className="relative max-w-md w-full mx-4">
        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-2xl animate-pulse-slow" />
        
        <div className="relative glass-card rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/25">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 via-pslate-500 to-red-600 bg-[length:200%_100%] animate-shimmer rounded-t-3xl" />

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-36 md:h-36 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-full animate-ping-slow" />
              <div className="absolute w-28 h-28 md:w-32 md:h-32 bg-gradient-to-r from-red-400/10 to-rose-400/10 rounded-full animate-pulse-slow animation-delay-300" />
              <div className="absolute w-24 h-24 md:w-28 md:h-28 bg-gradient-to-r from-red-300/10 to-rose-300/10 rounded-full animate-bounce-ring animation-delay-600" />
            </div>

            <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
              
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-red-500/25 border-2 border-white/20 flex items-center justify-center bg-slate-950">
                <Logo size={128} rounded="rounded-none" className="w-full h-full animate-soft-spin" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10" />
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-ping-slow" />
              </div>

              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                <span className="text-xs font-bold text-white">✦</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent tracking-tight">
              {loadingText}
              <span className="inline-block min-w-[1.5rem] text-red-500 dark:text-red-400">{dots}</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium">
              Please wait while we prepare your experience
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className="font-medium">Loading progress</span>
              <span className="font-mono bg-red-50 dark:bg-red-950/30 px-3 py-0.5 rounded-lg text-red-600 dark:text-red-400 font-bold">
                {progress}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-pslate-500 to-red-600 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full animate-bounce-dot"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              Connecting to PUCPC Community
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}