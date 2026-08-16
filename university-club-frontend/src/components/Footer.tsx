import { Link } from "react-router-dom";
import Logo from "./Logo";
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
  FaUsers,
  FaCode,
  FaArrowUp,
  FaShieldAlt,
} from "react-icons/fa";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Feed", path: "/feed" },
    { label: "Clubs", path: "/clubs" },
    { label: "Events", path: "/events" },
    { label: "Users", path: "/users" },
  ];

  const socialLinks = [
    { icon: FaFacebook, link: "https://www.facebook.com/CPCPrimeUniversity", label: "Facebook" },
    { icon: FaTwitter, link: "#", label: "Twitter" },
    { icon: FaInstagram, link: "#", label: "Instagram" },
    { icon: FaLinkedin, link: "https://www.linkedin.com/school/prime-university/posts/?feedView=all", label: "LinkedIn" },
    { icon: FaGithub, link: "#", label: "GitHub" },
  ];

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white shadow-2xl mt-auto border-t border-white/5">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent animate-shimmer" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Brand */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-md opacity-40" />
              <Logo size={48} className="relative shadow-xl shadow-black/30" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight">PUCPC</h2>
              <span className="text-xs font-medium text-slate-300">Community</span>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
            Prime University Computer Programming Club — connect, learn, and build together with fellow developers.
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-200 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 w-fit">
            <FaHeart className="text-red-400 animate-pulse" />
            <span className="text-xs">Made with love by</span>
            <a
              href="https://www.facebook.com/tamimkhan842/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:text-amber-300 transition-colors"
            >
              Tamim Khan
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-display font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-amber-400 rounded-full" />
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="group flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full group-hover:bg-amber-400 group-hover:scale-150 transition-all duration-300" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-display font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-amber-400 rounded-full" />
            Contact
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="group flex items-start gap-3 text-slate-300 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-all group-hover:scale-110">
                <FaPhoneAlt className="w-3.5 h-3.5" />
              </div>
              <span className="pt-1">+880 1234 567890</span>
            </li>
            <li className="group flex items-start gap-3 text-slate-300 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-all group-hover:scale-110">
                <FaEnvelope className="w-3.5 h-3.5" />
              </div>
              <span className="pt-1 break-all">support@pucpc.edu</span>
            </li>
            <li className="group flex items-start gap-3 text-slate-300 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-all group-hover:scale-110">
                <FaMapMarkerAlt className="w-3.5 h-3.5" />
              </div>
              <span className="pt-1">Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-display font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-amber-400 rounded-full" />
            Follow Us
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className="group relative flex items-center justify-center w-full aspect-square rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-black/30"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-medium bg-black/90 text-white px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                  {social.label}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-5 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FaUsers className="text-amber-400" />
                <span className="text-slate-300">2.5k+ Members</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <FaCode className="text-amber-400" />
                <span className="text-slate-300">Active Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="relative">
          <div className="border-t border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <FaCopyright className="w-3.5 h-3.5" />
            <span>{new Date().getFullYear()} PUCPC. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span>Built with</span>
              <FaHeart className="text-red-400 animate-pulse" />
              <span>for students</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <FaShieldAlt className="w-3 h-3" />
              <span>Secure</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Prime University Computer Programming Club
          </div>
        </div>

        <button
          onClick={scrollToTop}
          className="absolute bottom-6 right-6 md:bottom-6 md:right-6 w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 hover:scale-110 transition-all duration-300 shadow-xl shadow-black/30 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </button>
      </div>
    </footer>
  );
}
