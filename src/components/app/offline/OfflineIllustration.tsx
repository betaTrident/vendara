export function OfflineIllustration() {
  return (
    <svg
      viewBox="0 0 240 160"
      role="img"
      aria-label="Store disconnected from the internet"
      className="mx-auto h-36 w-full max-w-[240px] text-primary"
    >
      <defs>
        <linearGradient id="offline-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="160" rx="16" fill="url(#offline-sky)" />
      <path
        d="M120 34c-18 0-32 12-36 28h72c-4-16-18-28-36-28Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M96 62c8-10 20-16 24-16s16 6 24 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="120" cy="62" r="5" fill="currentColor" />
      <line
        x1="104"
        y1="48"
        x2="136"
        y2="76"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="88" y="92" width="64" height="44" rx="8" fill="currentColor" opacity="0.22" />
      <path
        d="M104 118h32M104 108h20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
