
const PATTERN_SVG =
  "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')";

const COLOR_SCHEMES = {
  red: {
    default: {
      top: "from-red-500/5 to-rose-500/5",
      bottom: "from-orange-500/5 to-amber-500/5",
      center: "from-red-500/3 to-rose-500/3",
    },
    auth: {
      top: "from-red-500/10 to-rose-500/10",
      bottom: "from-orange-500/10 to-amber-500/10",
      center: "from-red-500/5 to-rose-500/5",
    },
  },
  amber: {
    default: {
      top: "from-amber-500/5 to-rose-500/5",
      bottom: "from-orange-500/5 to-amber-500/5",
      center: "from-amber-500/3 to-rose-500/3",
    },
  },
  green: {
    auth: {
      top: "from-green-500/10 to-emerald-500/10",
      bottom: "from-amber-500/10 to-orange-500/10",
      center: "from-green-500/5 to-emerald-500/5",
    },
  },
};


export default function BackgroundDecoration({ blobs = 3, variant = "default", scheme = "red", pattern }) {
  const isAuth = variant === "auth";
  const showPattern = pattern !== undefined ? pattern : isAuth;
  const colors = (COLOR_SCHEMES[scheme] && COLOR_SCHEMES[scheme][variant]) || COLOR_SCHEMES.red.default;
  const centerSize = isAuth ? "w-[600px] h-[600px]" : "w-[800px] h-[800px]";

  return (
    <div className={`fixed inset-0 pointer-events-none ${isAuth ? "overflow-hidden" : ""}`}>
      <div
        className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${colors.top} rounded-full blur-3xl animate-float-slow`}
      />
      <div
        className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br ${colors.bottom} rounded-full blur-3xl animate-float-slow animation-delay-1000`}
      />
      {blobs >= 3 && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${centerSize} bg-gradient-to-r ${colors.center} rounded-full blur-2xl animate-spin-slow`}
        />
      )}
      {showPattern && <div className="absolute inset-0 opacity-30" style={{ backgroundImage: PATTERN_SVG }} />}
    </div>
  );
}
