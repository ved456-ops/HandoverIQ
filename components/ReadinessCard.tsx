"use client";

import type { KnowledgeGap, ReadinessScore } from "@/lib/api";

type Props = {
  readiness: ReadinessScore;
  gaps: KnowledgeGap[];
};

const BAND = {
  ready: { label: "Handover Ready", color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  at_risk: { label: "At Risk", color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  not_ready: { label: "Not Ready", color: "#ef4444", bg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" },
} as const;

/** Same formula as the backend (compute_readiness) so the score updates instantly. */
export function liveScore(r: ReadinessScore, gaps: KnowledgeGap[]) {
  const total = gaps.length;
  const resolved = gaps.filter((g) => g.resolved).length;
  const gap = total ? Math.round((100 * resolved) / total) : 100;
  const overall = Math.round(0.3 * r.bus_factor + 0.2 * r.hygiene + 0.2 * r.clarity + 0.3 * gap);
  const band = overall >= 75 ? "ready" : overall >= 50 ? "at_risk" : "not_ready";
  return { overall, band: band as keyof typeof BAND, gap, resolved, total };
}

function Bar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-zinc-500 dark:text-zinc-400">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{hint}</p>
    </div>
  );
}

export default function ReadinessCard({ readiness, gaps }: Props) {
  const s = liveScore(readiness, gaps);
  const band = BAND[s.band];
  const f = readiness.facts;
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <section className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white tracking-tight">Handover Readiness &amp; Bus-Factor Score</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Computed from real repository activity. Resolve knowledge gaps below to raise the score live.
          </p>
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border font-semibold ${band.bg}`}>
          {band.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-center">
        <div className="relative mx-auto h-[150px] w-[150px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#27272a" strokeWidth="10" className="stroke-zinc-100 dark:stroke-zinc-800" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={band.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - s.overall / 100)}
              style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{s.overall}</span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Bar
            label="Bus-Factor Distribution"
            value={readiness.bus_factor}
            hint={
              f.top_owner
                ? `${f.top_owner} wrote ${Math.round((f.top_owner_share ?? 0) * 100)}% of ${f.commits_sampled} recent commits (${f.contributors} contributors)`
                : "No commits sampled"
            }
          />
          <Bar
            label="PR & Issue Hygiene"
            value={readiness.hygiene}
            hint={`${f.stale_open_prs ?? 0} stale open PRs (>30d), ${f.open_bugs ?? 0} open bugs`}
          />
          <Bar
            label="Decision Clarity"
            value={readiness.clarity}
            hint="Commit and PR message depth and architectural rationale clarity"
          />
          <Bar
            label="Knowledge Gap Resolution"
            value={s.gap}
            hint={
              s.total
                ? `${s.resolved}/${s.total} gaps resolved (${s.total - s.resolved} pending)`
                : "No knowledge gaps flagged"
            }
          />
        </div>
      </div>
    </section>
  );
}
