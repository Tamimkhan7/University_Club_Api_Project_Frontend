import { Link } from "react-router-dom";
import {
  FaHeart,
  FaCopyright,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaRocket,
  FaUsers,
  FaCode,
  FaArrowUp,
  FaShieldAlt,
  FaAward,
} from "react-icons/fa";

/**
 * ============================================================
 *  🚀 Footer — Premium Community Footer Experience
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Brand identity + Navigation + Social        │
 *  │  🔥 Features: Animated gradients, hover effects, icons   │
 *  │  📱 Responsive: Mobile → Tablet → Desktop                │
 *  └─────────────────────────────────────────────────────────────┘
 */

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fixed: Removed duplicate '/home' and made proper navigation items
  const quickLinks = [
    { label: "🏠 Home", path: "/" },
    { label: "📱 Feed", path: "/feed" },
    { label: "🏛️ Clubs", path: "/clubs" },
    { label: "📅 Events", path: "/events" },
    { label: "👥 Users", path: "/users" },
  ];

  const socialLinks = [
    { icon: FaFacebook, link: "https://www.facebook.com/CPCPrimeUniversity", label: "Facebook" },
    { icon: FaTwitter, link: "#", label: "Twitter" },
    { icon: FaInstagram, link: "#", label: "Instagram" },
    { icon: FaLinkedin, link: "https://www.linkedin.com/school/prime-university/posts/?feedView=all", label: "LinkedIn" },
    { icon: FaGithub, link: "#", label: "GitHub" },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-2xl">
      {/* Premium Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl animate-spin-slow" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        {/* Animated Border Lines */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-right" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-left" />
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        
        {/* Brand Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-black/20">
                <FaCode className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-pulse">
                <span className="text-[8px] font-bold text-white">✦</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                PUCPC
              </h2>
              <span className="text-xs font-medium text-white/70">Community</span>
            </div>
          </div>

          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Prime University Computer Programming Club — connect, learn, and build together with fellow developers.
          </p>

          <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 w-fit">
            <FaHeart className="text-red-200 animate-pulse" />
            <span className="text-xs">Made with love by</span>
            <a
              href="https://www.facebook.com/tamimkhan842/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:underline hover:text-amber-200 transition-colors"
            >
              Tamim Khan
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5 w-fit">
            <FaAward className="text-amber-300" />
            <span className="italic">Dedicated to CSE students of Prime University</span>
          </div>
        </div>

        {/* Quick Links - Fixed: Using Link component and unique keys */}
        <div>
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-white/30 rounded-full" />
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="group flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full group-hover:bg-amber-300 group-hover:scale-150 transition-all duration-300" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-white/30 rounded-full" />
            Contact
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="group flex items-start gap-3 text-white/70 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all group-hover:scale-110">
                <FaPhoneAlt className="w-3.5 h-3.5" />
              </div>
              <span className="pt-1">+880 1234 567890</span>
            </li>
            <li className="group flex items-start gap-3 text-white/70 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all group-hover:scale-110">
                <FaEnvelope className="w-3.5 h-3.5" />
              </div>
              <span className="pt-1 break-all">support@pucpc.edu</span>
            </li>
            <li className="group flex items-start gap-3 text-white/70 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all group-hover:scale-110">
                <FaMapMarkerAlt className="w-3.5 h-3.5" />
              </div>
              <span className="pt-1">Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>

        {/* Social Media - Fixed: Added unique key */}
        <div>
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-white/30 rounded-full" />
            Follow Us
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className="group relative flex items-center justify-center w-full aspect-square rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-black/20"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                
                {/* Tooltip */}
                <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-medium bg-black/80 text-white px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
          
          {/* Community Stats */}
          <div className="mt-5 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FaUsers className="text-amber-300" />
                <span className="text-white/70">2.5k+ Members</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <FaCode className="text-amber-300" />
                <span className="text-white/70">Active Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider with Animation */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="relative">
          <div className="border-t border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full" />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <FaCopyright className="w-3.5 h-3.5" />
            <span>{new Date().getFullYear()} PUCPC. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span>Built with</span>
              <FaHeart className="text-red-200 animate-pulse" />
              <span>for students</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/50">
              <FaShieldAlt className="w-3 h-3" />
              <span>Secure</span>
            </div>
          </div>

          <div className="text-xs text-white/50 font-medium">
            Prime University Computer Programming Club
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="absolute bottom-6 right-6 md:bottom-6 md:right-6 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-xl shadow-black/20 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </button>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(100%); opacity: 1; }
        }
        @keyframes slide-left {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(-100%); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-slide-right {
          animation: slide-right 3s ease-in-out infinite;
        }
        .animate-slide-left {
          animation: slide-left 3s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </footer>
  );
}