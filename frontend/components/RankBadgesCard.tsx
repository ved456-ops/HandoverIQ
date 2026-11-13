"use client";

import { useEffect, useState } from "react";
import {
  ALL_BADGES,
  getCurrentRank,
  getTotalXp,
  getUnlockedBadges,
  type BadgeId,
  type UnlockedBadgeRecord,
} from "@/lib/achievements";
import { relativeDate } from "@/lib/utils";

export default function RankBadgesCard() {
  const [unlocked, setUnlocked] = useState<UnlockedBadgeRecord[]>([]);
  const [xp, setXp] = useState(0);
  const [rankInfo, setRankInfo] = useState(getCurrentRank());

  function refresh() {
    setUnlocked(getUnlockedBadges());
    setXp(getTotalXp());
    setRankInfo(getCurrentRank());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("handoveriq-badge-unlocked", refresh);
    return () => window.removeEventListener("handoveriq-badge-unlocked", refresh);
  }, []);

  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const { rank, nextRank, progress } = rankInfo;

  return (
    <div className="rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white/95 dark:bg-[#0C1017]/95 p-6 sm:p-8 shadow-sm space-y-7 animate-fadeIn">
      {/* ── RANK & XP PROGRESS HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#F0EFEA] dark:border-white/10 pb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-purple-500/10 via-emerald-500/10 to-amber-500/15 border-2 border-emerald-400/40 dark:border-emerald-500/40 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
            {rank.badge}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                Level {rank.level} Engineer
              </span>
              <span className="text-xs font-mono text-[#8A8A85] dark:text-zinc-500">
                {unlocked.length} of {Object.keys(ALL_BADGES).length} Badges Unlocked
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
              {rank.title}
            </h3>

            <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
              Earn Transition XP and unlock badges by completing handover audits, resolving knowledge gaps, and publishing dossiers.
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="md:w-64 space-y-2 bg-[#FBFBFA] dark:bg-zinc-900/60 p-4 rounded-2xl border border-[#E5E5E2] dark:border-white/10 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#171717] dark:text-white font-mono">
              {xp} XP Earned
            </span>
            <span className="font-mono text-[#8A8A85] dark:text-zinc-400 text-[11px]">
              {nextRank ? `Next: Level ${nextRank.level}` : "Max Rank Achieved"}
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-[#EBEBE8] dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-purple-600 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[10px] font-mono text-[#8A8A85] dark:text-zinc-500 text-right">
            {nextRank ? `${nextRank.minXp - xp} XP to ${nextRank.title}` : "Legendary Architect"}
          </p>
        </div>
      </div>

      {/* ── BADGES GALLERY GRID ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#171717] dark:text-white uppercase tracking-wider font-mono">
              Transition Achievement Badges
            </h4>
            <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
              Each small step in HandoverIQ awards XP and formal engineering badges
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(Object.keys(ALL_BADGES) as BadgeId[]).map((id) => {
            const badge = ALL_BADGES[id];
            const isUnlocked = unlockedIds.has(id);
            const unlockRecord = unlocked.find((u) => u.id === id);

            return (
              <div
                key={id}
                className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isUnlocked
                    ? "border-emerald-300 dark:border-emerald-700/60 bg-gradient-to-b from-emerald-50/40 via-white to-purple-50/20 dark:from-emerald-950/20 dark:via-zinc-900/60 dark:to-purple-950/20 shadow-sm"
                    : "border-dashed border-[#D6D5D0] dark:border-zinc-800 bg-[#FBFBFA]/50 dark:bg-zinc-900/20 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{badge.icon}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        isUnlocked
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      +{badge.xp} XP
                    </span>
                  </div>

                  <div>
                    <h5
                      className={`text-xs font-bold ${
                        isUnlocked
                          ? "text-[#171717] dark:text-white"
                          : "text-[#6B6B67] dark:text-zinc-400"
                      }`}
                    >
                      {badge.name}
                    </h5>
                    <p className="text-[11px] text-[#8A8A85] dark:text-zinc-500 leading-snug mt-1">
                      {badge.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0EFEA] dark:border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#8A8A85] dark:text-zinc-500 uppercase">
                    {badge.category}
                  </span>
                  {isUnlocked ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓ Unlocked</span>
                      {unlockRecord && (
                        <span className="text-[9px] text-[#A3A39E]">
                          ({relativeDate(unlockRecord.unlockedAt)})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[#A3A39E] dark:text-zinc-600">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
