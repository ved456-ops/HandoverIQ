/**
 * CurvesBackground — fixed, decorative page backdrop.
 * Clean, lightweight contour waves with full light & dark mode support.
 * Purely decorative (pointer-events-none, -z-10).
 */
export default function CurvesBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base canvas */}
      <div className="absolute inset-0 bg-[#FBFBFA] dark:bg-[#0A0B10] transition-colors duration-300" />

      {/* Soft colour washes */}
      <div className="absolute -top-48 -left-40 h-[560px] w-[560px] rounded-full bg-[#E9ECF5] dark:bg-[#151728] opacity-70 dark:opacity-40 blur-3xl animate-drift" />
      <div className="absolute top-1/3 -right-48 h-[520px] w-[520px] rounded-full bg-[#F3EEE6] dark:bg-[#181a24] opacity-70 dark:opacity-40 blur-3xl animate-drift-reverse" />

      {/* Contour curves (adaptive stroke for light/dark) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-60 dark:opacity-20"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1" className="text-zinc-900 dark:text-zinc-100 animate-wave-slow">
          <path d="M-100 180 C 260 60, 560 300, 900 170 S 1400 90, 1560 160" />
          <path d="M-100 230 C 280 110, 580 350, 920 220 S 1420 140, 1560 210" />
          <path d="M-100 280 C 300 160, 600 400, 940 270 S 1440 190, 1560 260" />
        </g>
        <g stroke="currentColor" strokeWidth="1" className="text-zinc-900 dark:text-zinc-100 animate-wave-slow-reverse">
          <path d="M-100 660 C 300 780, 700 520, 1080 640 S 1440 700, 1560 660" />
          <path d="M-100 710 C 320 830, 720 570, 1100 690 S 1460 750, 1560 710" />
          <path d="M-100 760 C 340 880, 740 620, 1120 740 S 1480 800, 1560 760" />
        </g>
      </svg>

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(251,251,250,0.8)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,11,16,0.85)_100%)] transition-colors duration-300" />
    </div>
  );
}
