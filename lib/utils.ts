/**
 * Small utility helpers shared across components.
 */

/** Format an ISO date string as a short relative description. */
export function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);

  if (years  > 0)  return `${years}y ago`;
  if (months > 0)  return `${months}mo ago`;
  if (days   > 0)  return `${days}d ago`;
  if (hours  > 0)  return `${hours}h ago`;
  if (mins   > 0)  return `${mins}m ago`;
  return "just now";
}

/** Truncate a string to maxLen characters with an ellipsis. */
export function truncate(s: string, maxLen = 100): string {
  if (!s) return "";
  const first = s.split("\n")[0].trim();  // first line only
  return first.length > maxLen ? first.slice(0, maxLen) + "…" : first;
}

/** Lighten a hex colour for use as a background tint on label badges. */
export function labelStyle(hex: string): { background: string; color: string } {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Perceived luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return {
    background: `#${hex}33`,          // 20% opacity tint
    color: lum > 0.5 ? "#1a1a1a" : `#${hex}`,
  };
}
