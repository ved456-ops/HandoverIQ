"use client";

import type { KnowledgeGap, ReadinessScore } from "@/lib/api";

type Props = {
  readiness: ReadinessScore;
  gaps: KnowledgeGap[];
};

const BAND = {
  ready: { label: "Handover Ready", color: "#059669", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  at_risk: { label: "At Risk", color: "#d97706", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  not_ready: { label: "Not Ready", color: "#dc2626", bg: "bg-red-50 text-red-700 border-red-200" },
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
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="font-mono text-zinc-500">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-[11px] text-zinc-400">{hint}</p>
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
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <div>
          <h3 className="font-semibold text-zinc-900 tracking-tight">Handover Readiness &amp; Bus-Factor Score</h3>
          <p className="text-xs text-zinc-500">
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
            <circle cx="60" cy="60" r={R} fill="none" stroke="#f4f4f5" strokeWidth="10" />
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
            <span className="text-4xl font-bold tracking-tight text-zinc-900">{s.overall}</span>
            <span className="text-[11px] text-zinc-400 font-mono">/ 100</span>
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
            label="Documentation Clarity"
            value={readiness.clarity}
            hint="Descriptive commit messages and PRs with descriptions"
          />
          <Bar
            label="Knowledge Gap Resolution"
            value={s.gap}
            hint={`${s.resolved} of ${s.total} gaps resolved`}
          />
        </div>
      </div>
      <p className="mt-5 text-[11px] text-zinc-400">
        Score = 30% bus-factor + 20% hygiene + 20% clarity + 30% gap resolution. Based on the most recent ~30 commits,
        PRs and issues fetched from GitHub.
      </p>
    </section>
  );
}
