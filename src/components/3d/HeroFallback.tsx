/**
 * Lightweight static stand-in for the 3D scene — shown while the Three.js
 * chunk loads, and permanently on mobile / low-end / reduced-motion devices.
 * Pure inline SVG: crisp at any DPR, zero network cost, no WebGL.
 */
export function HeroFallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <svg
        viewBox="0 0 220 260"
        className="h-[78%] w-auto drop-shadow-[0_24px_60px_rgba(16,185,129,0.18)]"
        aria-label="Wastelytix smart recycling bin"
        role="img"
      >
        <defs>
          <linearGradient id="binBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1d2f4f" />
            <stop offset="1" stopColor="#0e1626" />
          </linearGradient>
          <linearGradient id="binAccent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="binGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ambient glow */}
        <ellipse cx="110" cy="120" rx="105" ry="120" fill="url(#binGlow)" />

        {/* base */}
        <ellipse cx="110" cy="232" rx="62" ry="14" fill="#0a1120" />

        {/* body (faceted) */}
        <path
          d="M58 70 L162 70 L150 226 L70 226 Z"
          fill="url(#binBody)"
          stroke="#243a5e"
          strokeWidth="2"
        />
        {/* left facet highlight */}
        <path d="M58 70 L70 226 L92 226 L84 70 Z" fill="#ffffff" fillOpacity="0.04" />

        {/* lid */}
        <path
          d="M52 56 L168 56 L162 74 L58 74 Z"
          fill="#1d2f4f"
          stroke="#2b4368"
          strokeWidth="2"
        />
        <ellipse cx="110" cy="56" rx="58" ry="12" fill="#22304d" stroke="#2b4368" strokeWidth="2" />

        {/* deposit slot */}
        <rect x="86" y="60" width="48" height="7" rx="3.5" fill="#04070d" />

        {/* recycle ring accent */}
        <ellipse
          cx="110"
          cy="120"
          rx="56"
          ry="16"
          fill="none"
          stroke="url(#binAccent)"
          strokeWidth="3.5"
          opacity="0.9"
        />

        {/* recycle arrows */}
        <g stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M97 150 l8 -14 l8 14" />
          <path d="M120 156 l-2 16 l-15 -3" />
          <path d="M100 172 l-13 -10 l9 -13" />
        </g>

        {/* status LED */}
        <circle cx="138" cy="92" r="5" fill="#22d3ee" />
        <circle cx="138" cy="92" r="9" fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="2" />

        {/* cyan base accent line */}
        <path d="M73 210 L147 210" stroke="#22d3ee" strokeWidth="2.5" opacity="0.7" />
      </svg>
    </div>
  );
}
