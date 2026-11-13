"use client";

import { useState } from "react";
import Link from "next/link";
import type { HandoverReport, HandoverSection, KnowledgeGap } from "@/lib/api";
import ReadinessCard from "@/components/ReadinessCard";
import InsightCard from "@/components/InsightCard";
import MissingInfoPanel from "@/components/MissingInfoPanel";
import AskHandoverChat from "@/components/AskHandoverChat";
import { relativeDate } from "@/lib/utils";

type Props = {
  report: HandoverReport;
  onReset?: () => void;
  isStandalonePage?: boolean;
};

export default function HandoverReportView({
  report,
  onReset,
  isStandalonePage = false,
}: Props) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gaps, setGaps] = useState<KnowledgeGap[]>(report.knowledge_gaps);

  const sections: { key: string; number: string; data: HandoverSection }[] = [
    { key: "ownership", number: "01", data: report.ownership },
    { key: "unfinished_work", number: "02", data: report.unfinished_work },
    {
      key: "architectural_decisions",
      number: "03",
      data: report.architectural_decisions,
    },
    {
      key: "dependencies_and_setup",
      number: "04",
      data: report.dependencies_and_setup,
    },
    { key: "risks_and_debt", number: "05", data: report.risks_and_debt },
  ];

  function copyMarkdown() {
    let md = `# Handover Intelligence Report: ${report.repo_name}\n\n`;
    md += `Generated: ${report.generated_at} using ${report.generator}\n`;
    md += `Repository: ${report.repository_url}\n\n`;
    md += `## Executive Summary\n${report.executive_summary}\n\n`;

    sections.forEach(({ number, data }) => {
      md += `## ${number}. ${data.title}\n${data.summary}\n\n`;
      data.insights.forEach((i) => {
        md += `### ${i.title}\n${i.description}\n`;
        if (i.evidence && i.evidence.length > 0) {
          md +=
            `Evidence: ` +
            i.evidence.map((e) => `[${e.identifier}](${e.url})`).join(", ") +
            `\n\n`;
        }
      });
    });

    if (report.supplementary_notes) {
      md += `## Supplementary Off-GitHub Context (Slack / Meeting Notes)\n${report.supplementary_notes}\n\n`;
    }

    if (report.knowledge_gaps.length > 0) {
      md += `## Knowledge Gaps & Action Items\n`;
      report.knowledge_gaps.forEach((g) => {
        md += `- **[${g.category}] ${g.title}**: ${g.description} (Action: ${g.suggested_action})\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  }

  function copyShareLink() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const permalink = `${origin}/report/${report.report_id}`;
    navigator.clipboard.writeText(permalink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-zinc-900/95 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold">
                Handover Dossier
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                {report.repo_name}
              </span>
              {report.scope?.contributor && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                  @{report.scope.contributor}
                </span>
              )}
              {(report.scope?.since || report.scope?.until) && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                  {report.scope?.since || "start"} → {report.scope?.until || "today"}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Engineering Transition Report
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {report.executive_summary}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyShareLink}
              className="rounded-lg border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              {copiedLink ? "✓ Link Copied" : "Share Link"}
            </button>
            <button
              onClick={copyMarkdown}
              className="rounded-lg border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              {copiedMd ? "✓ Markdown Copied" : "Export .MD"}
            </button>
            {isStandalonePage && (
              <Link
                href="/workspace"
                className="rounded-lg bg-zinc-900 dark:bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:hover:bg-indigo-500 transition-colors"
              >
                ← Workspace
              </Link>
            )}
            {onReset && !isStandalonePage && (
              <button
                onClick={onReset}
                className="rounded-lg bg-zinc-900 dark:bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:hover:bg-indigo-500 transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>

        {/* Engine and Date Info */}
        <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 flex-wrap gap-2">
          <span>
            Synthesis Engine:{" "}
            <strong className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
              {report.generator}
            </strong>
          </span>
          <span className="font-mono">
            ID: {report.report_id.slice(0, 8)} · Generated{" "}
            {relativeDate(report.generated_at)}
          </span>
        </div>
      </div>

      {/* Readiness & Bus-Factor Score */}
      {report.readiness && <ReadinessCard readiness={report.readiness} gaps={gaps} />}

      {/* Supplementary Off-GitHub Context (Slack / Notes / RFCs) */}
      {report.supplementary_notes && (
        <section
          id="supplementary-context"
          className="rounded-2xl border border-indigo-200/80 dark:border-indigo-600/30 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/30 p-6 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold font-mono">
                #
              </span>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm tracking-tight">
                  Cross-Linked Off-GitHub Context (Slack / Meeting Notes)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Attached by departing team · Grounded into Handover Dossier &amp; RAG Copilot
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/60 dark:border-indigo-800">
              Indexed &amp; Cited
            </span>
          </div>
          <div className="rounded-xl border border-zinc-200/70 dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 p-4 text-xs text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {report.supplementary_notes}
          </div>
        </section>
      )}

      {/* 5 Core Pillars */}
      <div className="space-y-5">
        {sections.map(({ key, number, data }) => (
          <section
            key={key}
            className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-md">
                  {number}
                </span>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-base tracking-tight">
                  {data.title}
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                {data.insights.length} insight
                {data.insights.length !== 1 ? "s" : ""}
              </span>
            </div>

            {data.summary && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {data.summary}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {data.insights.map((insight, idx) => (
                <InsightCard
                  key={`${insight.title}-${idx}`}
                  insight={insight}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Ask the Handover (RAG chat) */}
      <AskHandoverChat reportId={report.report_id} />

      {/* Knowledge Gaps & Action Items */}
      <MissingInfoPanel
        gaps={report.knowledge_gaps}
        reportId={report.report_id}
        onUpdate={setGaps}
      />
    </div>
  );
}
