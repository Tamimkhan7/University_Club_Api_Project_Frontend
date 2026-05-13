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
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-2xl">

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* BRAND */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            PUCPC <span className="text-red-200">Community</span>
          </h2>

          <p className="text-white/80 text-sm leading-relaxed">
            Prime University Computer Programming Club — connect, learn, and build together.
          </p>

          <div className="flex items-center gap-2 text-sm text-white/80">
            <FaHeart className="text-red-200 animate-pulse" />
            Made with love by{" "}
            <a
              href="https://www.facebook.com/tamimkhan842/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:underline"
            >
              Tamim Khan
            </a>
          </div>

          <p className="text-xs text-white/70 italic">
            Dedicated to CSE students of Prime University
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold border-b border-white/30 pb-2 mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm text-white/80">
            {[
              { label: "Home", href: "/" },
              { label: "Feed", href: "/" },
              { label: "Clubs", href: "/clubs" },
              { label: "Users", href: "/users" },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="hover:text-white transition"
                >
                  • {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold border-b border-white/30 pb-2 mb-4">
            Contact
          </h3>

          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> +880 1234 567890
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> support@pucpc.edu
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt /> Dhaka, Bangladesh
            </li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-lg font-semibold border-b border-white/30 pb-2 mb-4">
            Follow Us
          </h3>

          <div className="flex gap-3">
            {[
              { icon: FaFacebook, link: "https://www.facebook.com/CPCPrimeUniversity" },
              { icon: FaTwitter, link: "#" },
              { icon: FaInstagram, link: "#" },
              { icon: FaLinkedin, link: "https://www.linkedin.com/school/prime-university/posts/?feedView=all" },
              { icon: FaGithub, link: "#" },
            ].map((s, i) => (
              <a
                key={i}
                href={s.link}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <s.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-white/20" />

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between text-sm text-white/80 gap-3">

        <div className="flex items-center gap-2">
          <FaCopyright />
          <span>{new Date().getFullYear()} PUCPC. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Built with</span>
          <FaHeart className="text-red-200 animate-pulse" />
          <span>for students</span>
        </div>

        <div className="text-xs text-white/60">
          Prime University Computer Programming Club
        </div>
      </div>
    </footer>
  );
}