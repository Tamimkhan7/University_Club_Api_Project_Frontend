export default function Logo({ size = 40, rounded = "rounded-2xl", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`${rounded} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pucpc-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fb7185" />
          <stop offset="0.55" stopColor="#e11d48" />
          <stop offset="1" stopColor="#9f1239" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#pucpc-logo-grad)" />
      <path d="M23 22 L14 32 L23 42" stroke="white" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M41 22 L50 32 L41 42" stroke="white" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M36 16 L28 48" stroke="white" strokeWidth="4.2" strokeLinecap="round" fill="none" opacity="0.92" />
    </svg>
  );
}
