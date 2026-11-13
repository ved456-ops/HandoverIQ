/**
 * Logo — renders the official HandoverIQ / CodeVengers 2026 brand assets.
 * In Dark Mode, inverts black to white and white to black for optimal visibility.
 */
type LogoProps = {
  variant?: "lockup" | "mark";
  /** Tailwind height class, e.g. "h-8". Width scales automatically. */
  heightClass?: string;
  className?: string;
};

export default function Logo({
  variant = "lockup",
  heightClass = "h-8",
  className = "",
}: LogoProps) {
  const src = variant === "mark" ? "/logo-mark.png" : "/logo-lockup.png";
  const alt =
    variant === "mark" ? "HandoverIQ" : "HandoverIQ — CodeVengers 2026";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`${heightClass} w-auto object-contain select-none transition-all duration-200 dark:invert ${className}`}
    />
  );
}
