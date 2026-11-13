"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Logo from "@/components/Logo";
import InteractiveHeroPreview from "@/components/InteractiveHeroPreview";
import InteractiveCodeMatrix from "@/components/InteractiveCodeMatrix";

/* ── Illustrative content (clearly labelled as examples in the UI) ── */

type Pillar = {
  num: string;
  title: string;
  summary: string;
  exampleTitle: string;
  exampleBody: string;
  impact: "critical" | "high" | "info";
  evidence: { type: string; id: string }[];
};

const PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Ownership",
    summary: "Who built and maintains each area, based on commit and review history.",
    exampleTitle: "Auth middleware is concentrated in one contributor",
    exampleBody:
      "Most recent changes to session and token handling come from a single author — a knowledge silo to address before they leave.",
    impact: "critical",
    evidence: [
      { type: "commit", id: "7f3a91c" },
      { type: "PR", id: "#118" },
    ],
  },
  {
    num: "02",
    title: "Unfinished work",
    summary: "Open pull requests, drafts, and active issues that could stall during transition.",
    exampleTitle: "Connection-pool migration is still unmerged",
    exampleBody:
      "An open PR introduces a new async connection pool and is waiting on load-test sign-off.",
    impact: "high",
    evidence: [
      { type: "PR", id: "#142" },
      { type: "issue", id: "#136" },
    ],
  },
  {
    num: "03",
    title: "Decisions",
    summary: "The reasoning behind refactors, reconstructed from commit messages and PR threads.",
    exampleTitle: "Moved from stateful sessions to signed tokens",
    exampleBody:
      "The change removed a cross-region session-store lookup from read-heavy routes.",
    impact: "info",
    evidence: [
      { type: "commit", id: "9c4d10e" },
      { type: "PR", id: "#94" },
    ],
  },
  {
    num: "04",
    title: "Dependencies",
    summary: "Languages, frameworks, and build tooling the successor needs to set up.",
    exampleTitle: "Python 3.13 · FastAPI · async HTTPX",
    exampleBody:
      "Strict Pydantic v2 validation and async HTTP clients with custom rate-limit handling.",
    impact: "info",
    evidence: [
      { type: "file", id: "requirements.txt" },
      { type: "commit", id: "4e11b8f" },
    ],
  },
  {
    num: "05",
    title: "Risks & gaps",
    summary: "Bug clusters, single points of failure, and questions to ask before sign-off.",
    exampleTitle: "No runbook for webhook secret rotation",
    exampleBody:
      "Nothing in the repository documents how signing keys are rotated or what happens on failure.",
    impact: "high",
    evidence: [
      { type: "issue", id: "#89" },
      { type: "PR", id: "#103" },
    ],
  },
];

const STACK = ["GitHub REST API", "FastAPI", "Next.js", "TypeScript", "Gemini", "Claude", "Pydantic", "Tailwind CSS"];

const impactStyle: Record<Pillar["impact"], string> = {
  critical: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
  high: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  info: "bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 border-neutral-200 dark:border-zinc-700",
};

export default function LandingPage() {
  const [active, setActive] = useState(0);
  const pillar = PILLARS[active];

  return (
    <div className="space-y-24 sm:space-y-32 pb-8">
      {/* ── HERO CONTAINER WITH MATRIX SPOTLIGHT ──────────────────── */}
      <section className="relative overflow-hidden rounded-[32px] border border-black/[0.08] dark:border-white/10 bg-[#FAFAF9]/80 dark:bg-[#07090E] p-6 sm:p-10 lg:p-12 shadow-xl shadow-black/[0.03]">
        {/* Greptile-style interactive cursor matrix canvas (strictly scoped to hero) */}
        <div className="hidden dark:block">
          <InteractiveCodeMatrix theme="dark" className="opacity-80" />
        </div>
        <div className="dark:hidden">
          <InteractiveCodeMatrix theme="light" className="opacity-40" />
        </div>

        {/* Ambient hero lighting */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] via-transparent to-transparent dark:from-cyan-500/[0.06] dark:via-transparent dark:to-black/40" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-6 sm:space-y-7">
            {/* Hackathon & Team Pill */}
            <div className="animate-fadeIn inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-zinc-900/90 px-3.5 py-1.5 text-xs text-[#4A4A47] dark:text-zinc-300 shadow-sm flex-wrap backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span><strong>CodersInPune Top 50 Finalist</strong> · Team CodeVengers:</span>
              <span className="font-semibold text-[#171717] dark:text-white">Ved Wandile, Diptesh Patil, Prachi Patil, Ritisha Songire</span>
            </div>

            <h1 className="animate-fadeIn-delayed text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-[-0.03em] leading-[1.08] text-[#171717] dark:text-white">
              When engineers leave,
              <br />
              <span className="text-[#8A8A85] dark:text-zinc-400">their context shouldn&apos;t.</span>
            </h1>

            <p className="animate-fadeIn-delayed text-base sm:text-lg text-[#5F5F5B] dark:text-zinc-300 leading-relaxed max-w-lg">
              HandoverIQ indexes repository commits, pull requests, issues, and Slack notes,
              synthesizing verified handover reports where every insight links directly to verifiable evidence.
            </p>

            {/* CTAs */}
            <div className="animate-fadeIn-delayed-2 flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/workspace"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] dark:bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 dark:shadow-indigo-600/30 hover:bg-black dark:hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
              >
                <span>Analyze a repository</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-900/80 px-6 py-3.5 text-sm font-medium text-[#171717] dark:text-white hover:bg-white dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm"
              >
                See how it works
              </a>
            </div>

            <div className="animate-fadeIn-delayed-2 flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-[#6B6B67] dark:text-zinc-400">
              <Check>No sign-up for public repos</Check>
              <Check>100% evidence-grounded</Check>
              <Check>Interactive RAG copilot</Check>
            </div>
          </div>

          {/* Hero preview terminal */}
          <div className="relative animate-fadeIn-delayed">
            <InteractiveHeroPreview />
          </div>
        </div>
      </section>

      {/* ── STACK MARQUEE ────────────────────────────────────────── */}
      <Reveal>
        <div className="space-y-4">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#8A8A85] dark:text-zinc-400 font-semibold">
            Built with open, production-ready developer tooling
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-12 py-2">
              {[...STACK, ...STACK].map((s, i) => (
                <span key={i} className="text-sm font-medium text-[#A3A39E] dark:text-zinc-400 whitespace-nowrap">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── SYSTEMATIC PROBLEM BREAKDOWN ─────────────────────────── */}
      <section id="product" className="scroll-mt-24 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal from="left">
          <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] dark:border-white/10 shadow-xl shadow-black/5 aspect-[5/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pair.jpg"
              alt="Two developers reviewing code together"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal from="right" delay={100}>
          <div className="space-y-6">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#171717] dark:text-white">
              Knowledge gets scattered across hundreds of commits.
            </h2>
            <p className="text-[#5F5F5B] dark:text-zinc-400 leading-relaxed">
              When engineers leave, the incoming engineer spends weeks reverse-engineering who owns what,
              which PRs are half-done, and why architectural trade-offs were made. Handover documents written
              from memory omit the crucial operational details.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {[
                ["Ownership is unclear", "Nobody knows who to ask about a critical module."],
                ["Work goes stale", "Open PRs, branches, and issues are silently abandoned."],
                ["Decisions are lost", "The architectural 'why' behind refactors disappears."],
                ["Risks stay hidden", "Credentials, runbooks, and failure modes go undocumented."],
              ].map(([t, d]) => (
                <div
                  key={t}
                  className="rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">{t}</p>
                  <p className="text-xs text-[#6B6B67] dark:text-zinc-400 mt-1">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── PILLARS EXPLORER ─────────────────────────────────────── */}
      <section id="pillars" className="scroll-mt-24 space-y-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <SectionLabel center>What&apos;s in a report</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717] dark:text-white">
              Five pillars, every claim sourced.
            </h2>
            <p className="text-[#5F5F5B] dark:text-zinc-400">
              Select any pillar to inspect how HandoverIQ synthesizes real engineering signals into actionable dossiers.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 flex flex-col gap-2">
              {PILLARS.map((p, i) => {
                const on = i === active;
                return (
                  <button
                    key={p.num}
                    onClick={() => setActive(i)}
                    className={`group text-left rounded-2xl border p-4 transition-all duration-300 ${
                      on
                        ? "border-[#171717] dark:border-indigo-500 bg-[#171717] dark:bg-zinc-900 text-white shadow-lg shadow-black/10 dark:shadow-indigo-500/10"
                        : "border-black/[0.06] dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 hover:border-black/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${on ? "text-white/60 dark:text-indigo-400" : "text-[#A3A39E]"}`}>{p.num}</span>
                      <span className="text-sm font-semibold text-[#171717] dark:text-white">{p.title}</span>
                      <span className={`ml-auto text-xs transition-transform ${on ? "translate-x-0 text-white" : "-translate-x-1 opacity-0 group-hover:opacity-60 group-hover:translate-x-0"}`}>→</span>
                    </div>
                    <p className={`mt-1.5 pl-8 text-xs leading-relaxed ${on ? "text-white/70 dark:text-zinc-300" : "text-[#6B6B67] dark:text-zinc-400"}`}>
                      {p.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 rounded-[28px] border border-black/[0.06] dark:border-white/10 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-black/[0.04] flex flex-col">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-4">
                <span className="text-sm font-semibold text-[#171717] dark:text-white">
                  Pillar {pillar.num} · {pillar.title}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A85] dark:text-zinc-400 font-mono">
                  Illustrative sample
                </span>
              </div>

              <div key={pillar.num} className="animate-fadeIn flex-1 py-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold leading-snug text-[#171717] dark:text-white">{pillar.exampleTitle}</h3>
                  <span className={`shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-mono font-medium ${impactStyle[pillar.impact]}`}>
                    {pillar.impact}
                  </span>
                </div>
                <p className="text-sm text-[#5F5F5B] dark:text-zinc-300 leading-relaxed">{pillar.exampleBody}</p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] text-[#8A8A85] dark:text-zinc-400 font-mono">Evidence:</span>
                  {pillar.evidence.map((e) => (
                    <Chip key={e.id}>
                      {e.type} {e.id} ↗
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.06] dark:border-white/10 pt-4">
                <span className="text-xs text-[#8A8A85] dark:text-zinc-400">In real reports, every citation links to GitHub.</span>
                <Link href="/workspace" className="text-xs font-semibold text-[#171717] dark:text-indigo-400 hover:underline underline-offset-4">
                  Run on your repository →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 order-2 lg:order-1">
          <Reveal>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#171717] dark:text-white">
              From URL to signed-off handover in three steps.
            </h2>
          </Reveal>

          <div className="space-y-3">
            {[
              ["Connect", "Paste a public GitHub URL or owner/repo. HandoverIQ pulls commits, PRs, and issues via the GitHub API."],
              ["Synthesize", "The AI engine parses activity into 5 structured pillars, calculating bus-factor score and cross-linking evidence."],
              ["Review & Ask", "Engineers query the handover copilot with RAG citations, resolve knowledge gaps, and export permanent markdown dossiers."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 120}>
                <div className="group flex gap-4 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-5 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-md transition-all">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] dark:bg-indigo-600 text-xs font-semibold text-white group-hover:scale-110 transition-transform">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#171717] dark:text-white">{t}</p>
                    <p className="text-sm text-[#6B6B67] dark:text-zinc-400 mt-1 leading-relaxed">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal from="right" className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] dark:border-white/10 shadow-xl shadow-black/5 aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/code.jpg" alt="Source code on a monitor" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] dark:border-white/10 shadow-2xl shadow-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desk.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#171717]/85 dark:bg-black/90" />
          <div className="relative px-6 py-16 sm:py-24 text-center text-white space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Run your first handover.
            </h2>
            <p className="text-white/80 max-w-lg mx-auto text-sm sm:text-base">
              Try a well-known open-source project in one click, or analyze your own repository.
            </p>
            <Link
              href="/workspace"
              className="group inline-flex items-center gap-2 rounded-full bg-white dark:bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-[#171717] dark:text-white hover:bg-neutral-100 dark:hover:bg-indigo-500 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <span>Open the workspace</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </section>
      </Reveal>

      <p className="text-center text-[10px] text-[#A3A39E] dark:text-zinc-500 -mt-16 font-mono">
        HandoverIQ · Team CodeVengers · CodersInPune Hackathon 2026
      </p>
    </div>
  );
}

/* ── Small primitives ──────────────────────────────────────────── */

function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8A85] dark:text-zinc-400 font-mono ${center ? "justify-center" : ""}`}>
      <span className="h-px w-6 bg-[#C9C9C4] dark:bg-zinc-700" />
      {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-black/[0.08] dark:border-white/10 bg-neutral-50 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-[#3F3F3C] dark:text-zinc-300">
      {children}
    </span>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#5F5F5B] dark:text-zinc-300">
      <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
      </svg>
      {children}
    </span>
  );
}
