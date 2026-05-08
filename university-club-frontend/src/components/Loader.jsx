import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Loader() {
  const [loadingText, setLoadingText] = useState("Loading");
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-center z-50">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full animate-ping"></div>
          <div className="absolute w-40 h-40 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full animate-pulse delay-75"></div>
          <div className="absolute w-32 h-32 bg-gradient-to-r from-blue-300/10 to-purple-400/10 rounded-full animate-bounce"></div>
        </div>

        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 min-w-[320px] border border-slate-200/50 dark:border-slate-700/50">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-12 h-12 text-white animate-spin" style={{ animation: "spin 2s linear infinite" }} />
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {loadingText}{dots}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Please wait while we prepare your experience</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Loading progress</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-center gap-1 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}