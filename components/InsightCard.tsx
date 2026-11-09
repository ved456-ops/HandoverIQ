"use client";

import type { HandoverInsight } from "@/lib/api";

type Props = {
  insight: HandoverInsight;
};

export default function InsightCard({ insight }: Props) {
  const impactStyles = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    medium: "bg-zinc-100 text-zinc-700 border-zinc-200",
    low: "bg-zinc-50 text-zinc-500 border-zinc-200",
    info: "bg-zinc-50 text-zinc-500 border-zinc-200",
  };

  const currentImpact = insight.impact ?? "info";

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm space-y-2.5 hover:border-zinc-300 transition-colors flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-zinc-900 leading-snug">
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

        <p className="text-xs text-zinc-500 leading-relaxed">
          {insight.description}
        </p>
      </div>

      {/* Verified Evidence Link Chips */}
      {insight.evidence && insight.evidence.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mr-0.5">
            Source:
          </span>
          {insight.evidence.map((ev, idx) => (
            <a
              key={`${ev.identifier}-${idx}`}
              href={ev.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              title={`${ev.type}: ${ev.title}`}
            >
              <span className="text-[10px] text-zinc-400">
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
