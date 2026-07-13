import { useState, useEffect } from "react";

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
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-red-950/20 dark:to-gray-900 flex justify-center items-center z-50">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-full animate-ping" />
          <div className="absolute w-40 h-40 bg-gradient-to-r from-red-400/20 to-rose-400/20 rounded-full animate-pulse delay-75" />
          <div className="absolute w-32 h-32 bg-gradient-to-r from-red-300/20 to-rose-300/20 rounded-full animate-bounce" />
        </div>

        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-500/10 p-8 min-w-[340px] border border-white/30 dark:border-gray-700/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-rose-500 animate-shimmer" />

          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-xl shadow-red-500/25">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVifde8HHEEoz6yz-nSHMKMMRNOeHfCE-GoA&s"
                alt="PUCPC Logo"
                className="w-full h-full object-cover animate-softSpin"
              />
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pingSlow" />
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {loadingText}{dots}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Please wait while we prepare your experience</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Loading progress</span>
              <span className="font-mono text-red-600 dark:text-red-400 font-semibold">{progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full transition-all duration-300 ease-out relative" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1.5 mt-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes softSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pingSlow { 0% { transform: scale(1); opacity: 0.6; } 75%, 100% { transform: scale(1.2); opacity: 0; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-softSpin { animation: softSpin 3s linear infinite; }
        .animate-pingSlow { animation: pingSlow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
}
