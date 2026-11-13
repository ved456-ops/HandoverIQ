"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DEMO_FLASK,
  DEMO_HELLO_WORLD,
  getOfflineDemoReport,
} from "@/lib/demoReports";
import type { HandoverReport } from "@/lib/api";

type BenchmarkPair = {
  label: string;
  repoA: string;
  repoB: string;
  description: string;
};

const PRESET_PAIRS: BenchmarkPair[] = [
  {
    label: "Bus Factor Comparison: Concentrated vs Distributed",
    repoA: "pallets/flask",
    repoB: "octocat/Hello-World",
    description:
      "Compare a codebase with a 90% single-maintainer bottleneck against a distributed, multi-contributor repository.",
  },
  {
    label: "Framework Migration: Flask vs Python Architecture",
    repoA: "pallets/flask",
    repoB: "https://github.com/pallets/flask",
    description:
      "Audit transition readiness for critical web service backbones.",
  },
];

export default function RepoComparisonSection() {
  const [selectedPair, setSelectedPair] = useState<number>(0);
  const [customRepoA, setCustomRepoA] = useState("pallets/flask");
  const [customRepoB, setCustomRepoB] = useState("octocat/Hello-World");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const reportA: HandoverReport =
    getOfflineDemoReport(customRepoA) || DEMO_FLASK;
  const reportB: HandoverReport =
    getOfflineDemoReport(customRepoB) || DEMO_HELLO_WORLD;

  function selectPreset(idx: number) {
    setSelectedPair(idx);
    setIsCustomMode(false);
    setCustomRepoA(PRESET_PAIRS[idx].repoA);
    setCustomRepoB(PRESET_PAIRS[idx].repoB);
  }

  const scoreA = reportA.readiness?.overall ?? 74;
  const scoreB = reportB.readiness?.overall ?? 68;

  const busFactorA = reportA.readiness?.bus_factor ?? 55;
  const busFactorB = reportB.readiness?.bus_factor ?? 100;

  const gapsA = reportA.knowledge_gaps.filter((g) => !g.resolved).length;
  const gapsB = reportB.knowledge_gaps.filter((g) => !g.resolved).length;

  const topOwnerA =
    reportA.readiness?.facts.top_owner ??
    reportA.ownership.insights[0]?.title.replace("Primary Contributor: ", "") ??
    "Lead Dev";
  const topShareA = Math.round(
    (reportA.readiness?.facts.top_owner_share ?? 0.9) * 100
  );

  const topOwnerB =
    reportB.readiness?.facts.top_owner ??
    reportB.ownership.insights[0]?.title.replace("Primary Contributor: ", "") ??
    "Maintainer";
  const topShareB = Math.round(
    (reportB.readiness?.facts.top_owner_share ?? 0.33) * 100
  );

  return (
    <section className="rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white/95 dark:bg-[#0C1017]/95 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EFEA] dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              ⚖
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              Comparative Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
            Repository Transition Readiness Benchmark
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B67] dark:text-zinc-400 max-w-2xl leading-relaxed">
            Side-by-side engineering transition risk evaluation. Compare single-contributor bottleneck risks, PR hygiene, and unresolved knowledge debt across repositories.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {PRESET_PAIRS.map((pair, idx) => (
            <button
              key={pair.label}
              type="button"
              onClick={() => selectPreset(idx)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedPair === idx && !isCustomMode
                  ? "bg-[#171717] dark:bg-white text-white dark:text-zinc-950 font-semibold shadow-sm"
                  : "border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-800 text-[#6B6B67] dark:text-zinc-300 hover:border-[#171717]"
              }`}
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Preset summary banner */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 text-xs flex items-center justify-between gap-3 text-indigo-900 dark:text-indigo-300 font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>
            Evaluating: <strong className="text-[#171717] dark:text-white">{reportA.repo_name}</strong> vs{" "}
            <strong className="text-[#171717] dark:text-white">{reportB.repo_name}</strong>
          </span>
        </div>
        <span className="text-[11px] text-indigo-700 dark:text-indigo-400 hidden sm:inline">
          {PRESET_PAIRS[selectedPair]?.description}
        </span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* REPOSITORY A */}
        <div className="rounded-2xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900/60 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#F0EFEA] dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A85] dark:text-zinc-500">
                  Repository Candidate A
                </span>
                <h3 className="text-base font-bold text-[#171717] dark:text-white font-mono mt-0.5">
                  {reportA.repo_name}
                </h3>
              </div>
              <span className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-[#6B6B67] dark:text-zinc-300">
                {reportA.dependencies_and_setup.insights[0]?.title.replace("Primary Ecosystem: ", "") || "Multi-language"}
              </span>
            </div>

            {/* Score Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-[#E5E5E2] dark:border-white/10">
              <span className="text-xs font-semibold text-[#171717] dark:text-white">
                Handover Readiness
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-[#171717] dark:text-white">
                  {scoreA}
                </span>
                <span className="text-[11px] font-mono text-[#8A8A85]">/ 100</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Bus-Factor Health</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {busFactorA}/100 (Single-Maintainer Risk)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Top Owner Concentration</span>
                <span className="font-mono font-bold text-[#171717] dark:text-white">
                  {topOwnerA} ({topShareA}% of commits)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Unfinished Work Items</span>
                <span className="font-mono font-semibold text-[#171717] dark:text-white">
                  {reportA.unfinished_work.insights.length} in-flight tasks
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Open Knowledge Gaps</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {gapsA} unresolved gaps
                </span>
              </div>
            </div>

            {/* Verdict Note */}
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
              <strong>Leadership Assessment:</strong> Critical knowledge silo on @{topOwnerA}. Offboarding without a structured 5-pillar dossier will create significant operational disruption.
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/report/${reportA.report_id}`}
              className="w-full inline-block text-center rounded-xl bg-[#171717] dark:bg-white text-white dark:text-zinc-950 py-2.5 text-xs font-semibold hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-sm"
            >
              Inspect {reportA.repo_name} Full Dossier →
            </Link>
          </div>
        </div>

        {/* REPOSITORY B */}
        <div className="rounded-2xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900/60 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#F0EFEA] dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A85] dark:text-zinc-500">
                  Repository Candidate B
                </span>
                <h3 className="text-base font-bold text-[#171717] dark:text-white font-mono mt-0.5">
                  {reportB.repo_name}
                </h3>
              </div>
              <span className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-[#6B6B67] dark:text-zinc-300">
                {reportB.dependencies_and_setup.insights[0]?.title.replace("Primary Ecosystem: ", "") || "Multi-language"}
              </span>
            </div>

            {/* Score Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-[#E5E5E2] dark:border-white/10">
              <span className="text-xs font-semibold text-[#171717] dark:text-white">
                Handover Readiness
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-[#171717] dark:text-white">
                  {scoreB}
                </span>
                <span className="text-[11px] font-mono text-[#8A8A85]">/ 100</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Bus-Factor Health</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {busFactorB}/100 (Distributed Team)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Top Owner Concentration</span>
                <span className="font-mono font-bold text-[#171717] dark:text-white">
                  {topOwnerB} ({topShareB}% of commits)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Unfinished Work Items</span>
                <span className="font-mono font-semibold text-[#171717] dark:text-white">
                  {reportB.unfinished_work.insights.length} in-flight tasks
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B67] dark:text-zinc-400">Open Knowledge Gaps</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {gapsB} unresolved gaps
                </span>
              </div>
            </div>

            {/* Verdict Note */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
              <strong>Leadership Assessment:</strong> Low key-person risk. Contributions are evenly distributed across multiple authors. Focus transition on documented deployment procedures.
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/report/${reportB.report_id}`}
              className="w-full inline-block text-center rounded-xl bg-[#171717] dark:bg-white text-white dark:text-zinc-950 py-2.5 text-xs font-semibold hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-sm"
            >
              Inspect {reportB.repo_name} Full Dossier →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
