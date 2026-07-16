import { Component } from "react";
import { AlertTriangle, RefreshCw, Bug, Shield, Home, Terminal, ExternalLink, Copy, Check } from "lucide-react";

/**
 * ============================================================
 *  🛡️ ErrorBoundary — Premium Error Handling Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Catch rendering errors gracefully            │
 *  │  🔍 Visibility: Error shown in UI + Console              │
 *  │  🔄 Recovery: Reset to feed or homepage                  │
 *  └─────────────────────────────────────────────────────────────┘
 */

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-red-50 via-rose-50/50 to-orange-50/50 dark:from-gray-900 dark:via-red-950/30 dark:to-gray-900">
          {/* Premium Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-full blur-2xl animate-spin-slow" />
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          </div>

          {/* Main Error Card */}
          <div className="relative max-w-2xl w-full">
            {/* Decorative Top Gradient Border */}
            <div className="absolute -top-1 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 via-pink-500 to-red-600 bg-[length:200%_100%] animate-gradient-x rounded-t-3xl" />

            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/20 dark:shadow-red-500/10 p-8 md:p-10 border border-white/30 dark:border-gray-700/50 transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/25">
              
              {/* Error Icon with Premium Design */}
              <div className="relative flex justify-center mb-6">
                <div className="relative">
                  {/* Outer Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
                  
                  {/* Icon Container */}
                  <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 transform hover:scale-110 transition-transform duration-500">
                    <AlertTriangle className="w-12 h-12 text-white" />
                    
                    {/* Decorative Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/40 animate-bounce-slow">
                      <Bug className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Pulse Ring */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/20 animate-ping-slow" />
                  </div>
                </div>
              </div>

              {/* Error Title */}
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                  Oops! Something Broke
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Don't worry, we've caught this error and logged it for our team to investigate.
                </p>
              </div>

              {/* Error Details Card */}
              <div className="mb-6 bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-800/30 overflow-hidden shadow-inner">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-red-100/50 dark:bg-red-900/20 border-b border-red-200/50 dark:border-red-800/30">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">Error Details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-red-200/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-mono">
                      {new Error().stack?.split('\n')[0]?.match(/\(.*\)/)?.[0]?.replace(/[()]/g, '') || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                <div className="p-4">
                  <div className="relative group">
                    <pre className="text-xs font-mono bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 overflow-x-auto text-red-600 dark:text-red-400 whitespace-pre-wrap break-all border border-red-200/50 dark:border-red-800/30 leading-relaxed">
                      {String(this.state.error?.message || this.state.error)}
                    </pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard?.writeText(String(this.state.error?.message || this.state.error));
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700 shadow-lg"
                      title="Copy error message"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-green-500" />
                    <span>Error logged to console (F12 → Console tab)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-[length:200%_100%] animate-gradient-x text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <RefreshCw className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" />
                  <span>Return to Feed</span>
                  <Home className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-semibold bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-600/80 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Refresh Page</span>
                </button>
              </div>

              {/* Footer Note */}
              <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span>Error logged</span>
                </div>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  <span>Check console for stack trace</span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Styles for Animations */}
          <style>{`
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes pulse-slow {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.05); }
            }
            @keyframes spin-slow {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes ping-slow {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-gradient-x {
              animation: gradient-x 3s ease infinite;
              background-size: 200% 100%;
            }
            .animate-pulse-slow {
              animation: pulse-slow 4s ease-in-out infinite;
            }
            .animate-spin-slow {
              animation: spin-slow 20s linear infinite;
            }
            .animate-bounce-slow {
              animation: bounce-slow 2s ease-in-out infinite;
            }
            .animate-ping-slow {
              animation: ping-slow 2s ease-in-out infinite;
            }
            .animation-delay-1000 {
              animation-delay: 1s;
            }
          `}</style>
        </div>
      );
    }
    return this.props.children;
  }
}