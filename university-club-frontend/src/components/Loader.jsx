import { Sparkles } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 w-20 h-20 gradient-bg rounded-2xl mx-auto opacity-50 blur-xl"></div>
        </div>
        <p className="text-slate-500 mt-4 font-medium">Loading profile...</p>
      </div>
    </div>
  );
}