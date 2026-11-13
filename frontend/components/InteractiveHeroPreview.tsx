"use client";

import { useState } from "react";
import Link from "next/link";
import InteractiveCodeMatrix from "@/components/InteractiveCodeMatrix";

export default function InteractiveHeroPreview() {
  const [activeTab, setActiveTab] = useState<"rag" | "readiness" | "slack">("readiness");

  return (
    <div className="relative rounded-[28px] border border-white/10 bg-[#0A0B10] p-5 sm:p-7 shadow-2xl overflow-hidden text-white">
      {/* Interactive mouse-reactive code matrix canvas */}
      <InteractiveCodeMatrix theme="dark" className="opacity-90" />

      {/* Subtle top lighting vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/[0.07] via-transparent to-black/60" />

      <div className="relative z-10 space-y-5">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="font-mono text-xs text-zinc-400 pl-1">
              handoveriq-dossier-v1.0.sh
            </span>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("readiness")}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                activeTab === "readiness"
                  ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Readiness: 85/100
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rag")}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                activeTab === "rag"
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Ask Copilot
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("slack")}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                activeTab === "slack"
                  ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Slack Notes
            </button>
          </div>
        </div>

        {/* Tab 1: Readiness Score Gauge */}
        {activeTab === "readiness" && (
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-6 items-center py-2 animate-fadeIn">
            <div className="relative mx-auto h-[120px] w-[120px]">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - 0.85)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono text-white">85</span>
                <span className="text-[10px] font-mono text-emerald-400">HANDOVER READY</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-300">Bus-Factor Distribution</span>
                  <span className="text-emerald-400">82/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[82%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-300">PR &amp; Issue Hygiene</span>
                  <span className="text-emerald-400">90/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[90%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-300">Knowledge Gap Resolution</span>
                  <span className="text-emerald-400">100% (2/2 Resolved)</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: RAG Copilot */}
        {activeTab === "rag" && (
          <div className="space-y-3 py-1 animate-fadeIn">
            <div className="flex justify-end">
              <div className="rounded-xl rounded-br-sm bg-white/10 border border-white/10 px-3.5 py-1.5 text-xs text-zinc-100 font-mono">
                &gt; Where are staging credentials and unmerged PRs?
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3.5 text-xs space-y-2">
              <p className="text-zinc-200 leading-relaxed font-mono">
                Based on indexed repository evidence &amp; Slack thread:
                <br />
                1. Staging DB credentials in 1Password vault <span className="text-emerald-300 font-bold">&apos;HandoverIQ-Staging&apos;</span>.
                <br />
                2. Auth refactor in <span className="text-indigo-300 font-bold">PR #42</span> is waiting on final security compliance sign-off.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-mono text-indigo-300">
                  PR #42 ↗
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-300">
                  Note Note #1 ↗
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                  100% Grounded
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Slack Context */}
        {activeTab === "slack" && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 text-xs space-y-2 animate-fadeIn font-mono">
            <div className="flex items-center justify-between text-[11px] text-cyan-300 border-b border-cyan-500/20 pb-2">
              <span>#eng-handover-channel (Slack Ingestion)</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200">CROSS-LINKED</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              <span className="text-cyan-400 font-bold">@alex.dev:</span> &quot;Staging secrets are in 1Password vault &apos;HandoverIQ-Staging&apos;. Database URL is set in Railway dashboard.&quot;
              <br />
              <span className="text-cyan-400 font-bold">@ved.ops:</span> &quot;Persistent SQLite DB configured at /data/handoveriq.db so reports survive restarts.&quot;
            </p>
          </div>
        )}

        {/* Interactive Bottom Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
          <span className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Move cursor to illuminate git knowledge matrix
          </span>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
          >
            Launch Interactive Analyzer →
          </Link>
        </div>
      </div>
    </div>
  );
}
