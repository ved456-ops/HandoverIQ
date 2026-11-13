"use client";

import { useEffect, useState } from "react";
import type { Badge, UserRank } from "@/lib/achievements";

type ToastData = {
  badge: Badge;
  totalXp: number;
  rank: UserRank;
};

export default function AchievementToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    function handleBadgeUnlocked(e: Event) {
      const custom = e as CustomEvent<ToastData>;
      if (custom.detail) {
        setToast(custom.detail);
        const timer = setTimeout(() => {
          setToast(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }

    window.addEventListener("handoveriq-badge-unlocked", handleBadgeUnlocked);
    return () =>
      window.removeEventListener("handoveriq-badge-unlocked", handleBadgeUnlocked);
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-fadeIn no-print pointer-events-auto">
      <div className="rounded-2xl border-2 border-emerald-400/80 dark:border-emerald-500/80 bg-white/95 dark:bg-[#0C1017]/95 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(16,185,129,0.25)] flex items-start gap-3.5 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-purple-500" />

        {/* Mascot / Badge Icon */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-purple-100 dark:from-emerald-950/60 dark:to-purple-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-2xl shrink-0 shadow-inner">
          {toast.badge.icon}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              Achievement Unlocked!
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              +{toast.badge.xp} XP
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#171717] dark:text-white truncate">
            {toast.badge.name}
          </h4>

          <p className="text-[11px] text-[#6B6B67] dark:text-zinc-400 leading-tight">
            {toast.badge.description}
          </p>

          <div className="pt-1.5 flex items-center gap-2 text-[10px] font-mono text-[#8A8A85] dark:text-zinc-400">
            <span>Rank:</span>
            <span className="font-semibold text-[#171717] dark:text-white flex items-center gap-1">
              <span>{toast.rank.badge}</span>
              <span>{toast.rank.title} (Lvl {toast.rank.level})</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setToast(null)}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 shrink-0"
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
