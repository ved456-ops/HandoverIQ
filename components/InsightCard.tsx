"use client";

import type { HandoverInsight } from "@/lib/api";

type Props = {
  insight: HandoverInsight;
};

export default function InsightCard({ insight }: Props) {
  const impactStyles = {
    critical: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    high: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    medium: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    low: "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    info: "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  };

  const currentImpact = insight.impact ?? "info";

  return (
    <div className="rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-4 shadow-sm space-y-2.5 hover:border-zinc-300 dark:hover:border-white/20 transition-colors flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
            {insight.title}
          </h4>
          {insight.impact && insight.impact !== "info" && (
            <span
              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-md border font-mono font-medium uppercase tracking-wider ${impactStyles[currentImpact]}`}
            >
              {insight.impact}
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {insight.description}
        </p>
      </div>

      {/* Verified Evidence Link Chips */}
      {insight.evidence && insight.evidence.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-white/10 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-0.5">
            Source:
          </span>
          {insight.evidence.map((ev, idx) => (
            <a
              key={`${ev.identifier}-${idx}`}
              href={ev.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              title={`${ev.type}: ${ev.title}`}
            >
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {ev.type === "commit"
                  ? "commit"
                  : ev.type === "pull_request"
                  ? "PR"
                  : ev.type}
              </span>
              <span className="font-semibold">{ev.identifier}</span>
              <span className="text-[10px] opacity-60">↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
