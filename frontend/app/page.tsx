"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Logo from "@/components/Logo";

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
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export default function LandingPage() {
  const [active, setActive] = useState(0);
  const pillar = PILLARS[active];

  return (
    <div className="space-y-28 sm:space-y-36 pb-8">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-4 sm:pt-10">
        <div className="space-y-7">
          <div className="animate-fadeIn inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-1 text-xs text-[#4A4A47] shadow-sm flex-wrap">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Built by <strong>Team CodeVengers</strong>:</span>
            <span className="font-bold text-emerald-700">Ved Wandile (Lead)</span>
            <span className="text-[#8A8A85]">· Diptesh Patil · Prachi Patil · Ritisha Songire</span>
          </div>

          <h1 className="animate-fadeIn-delayed text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-[-0.03em] leading-[1.05]">
            When engineers leave,
            <br />
            <span className="text-[#8A8A85]">their context shouldn&apos;t.</span>
          </h1>

          <p className="animate-fadeIn-delayed text-base sm:text-lg text-[#5F5F5B] leading-relaxed max-w-lg">
            HandoverIQ reads a repository&apos;s commits, pull requests, and issues,
            then writes a handover report where every claim links back to its source.
          </p>

          <div className="animate-fadeIn-delayed-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/workspace"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:bg-black transition-all hover:-translate-y-0.5"
            >
              Analyze a repository
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 px-6 py-3.5 text-sm font-medium hover:bg-white transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="animate-fadeIn-delayed-2 flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-[#6B6B67]">
            <Check>No sign-up for public repos</Check>
            <Check>Source-linked insights</Check>
            <Check>Free to run</Check>
          </div>
        </div>

        {/* Hero visual: real photo + floating report card */}
        <div className="relative animate-fadeIn-delayed">
          <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] shadow-2xl shadow-black/10 aspect-[4/3.4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/team.jpg"
              alt="Engineering team working together at laptops"
              className="h-full w-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Floating card — illustrative */}
          <div className="absolute -bottom-8 -left-4 sm:-left-10 w-[78%] sm:w-[64%] rounded-2xl border border-black/[0.06] bg-white/95 backdrop-blur p-4 shadow-xl animate-float">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A85]">
                Illustrative example
              </span>
              <span className="text-[10px] rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-700 font-medium">
                critical
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug">
              Auth middleware owned by one departing engineer
            </p>
            <div className="mt-3 flex gap-1.5">
              <Chip>commit 7f3a91c</Chip>
              <Chip>PR #142</Chip>
            </div>
          </div>

          <div className="hidden sm:flex absolute -top-5 -right-4 items-center gap-2 rounded-full border border-black/[0.06] bg-white/95 px-3.5 py-2 shadow-lg">
            <Logo variant="mark" heightClass="h-5" />
            <span className="text-xs font-medium">Report ready</span>
          </div>
        </div>
      </section>

      {/* ── STACK MARQUEE ────────────────────────────────────────── */}
      <Reveal>
        <div className="space-y-4">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#8A8A85]">
            Built with open, free-tier tooling
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-12 py-2">
              {[...STACK, ...STACK].map((s, i) => (
                <span key={i} className="text-sm font-medium text-[#A3A39E] whitespace-nowrap">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── PROBLEM ──────────────────────────────────────────────── */}
      <section id="product" className="scroll-mt-24 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal from="left">
          <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] shadow-xl shadow-black/5 aspect-[5/4]">
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
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Knowledge gets scattered across hundreds of commits.
            </h2>
            <p className="text-[#5F5F5B] leading-relaxed">
              The person taking over has to reverse-engineer who owns what, which
              work is half-done, and why things were built the way they were.
              Handover documents written from memory miss the details that matter.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {[
                ["Ownership is unclear", "Nobody knows who to ask about a module."],
                ["Work goes stale", "Open PRs and issues are forgotten."],
                ["Decisions are lost", "The why behind changes disappears."],
                ["Risks stay hidden", "Credentials and runbooks go undocumented."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-black/[0.06] bg-white/80 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-xs text-[#6B6B67] mt-1">{d}</p>
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
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Five pillars, every claim sourced.
            </h2>
            <p className="text-[#5F5F5B]">
              Select a pillar to see the kind of insight HandoverIQ produces.
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
                        ? "border-[#171717] bg-[#171717] text-white shadow-lg shadow-black/10"
                        : "border-black/[0.06] bg-white/70 hover:bg-white hover:border-black/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${on ? "text-white/60" : "text-[#A3A39E]"}`}>{p.num}</span>
                      <span className="text-sm font-semibold">{p.title}</span>
                      <span className={`ml-auto text-xs transition-transform ${on ? "translate-x-0" : "-translate-x-1 opacity-0 group-hover:opacity-60 group-hover:translate-x-0"}`}>→</span>
                    </div>
                    <p className={`mt-1.5 pl-8 text-xs leading-relaxed ${on ? "text-white/70" : "text-[#6B6B67]"}`}>
                      {p.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 rounded-[28px] border border-black/[0.06] bg-white p-6 sm:p-8 shadow-xl shadow-black/[0.04] flex flex-col">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <span className="text-sm font-semibold">
                  Pillar {pillar.num} · {pillar.title}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A85]">
                  Illustrative example
                </span>
              </div>

              <div key={pillar.num} className="animate-fadeIn flex-1 py-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">{pillar.exampleTitle}</h3>
                  <span className={`shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${impactStyle[pillar.impact]}`}>
                    {pillar.impact}
                  </span>
                </div>
                <p className="text-sm text-[#5F5F5B] leading-relaxed">{pillar.exampleBody}</p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] text-[#8A8A85]">Evidence</span>
                  {pillar.evidence.map((e) => (
                    <Chip key={e.id}>
                      {e.type} {e.id} ↗
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.06] pt-4">
                <span className="text-xs text-[#8A8A85]">In real reports, every chip opens GitHub.</span>
                <Link href="/workspace" className="text-xs font-semibold hover:underline underline-offset-4">
                  Try it on a repo →
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
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              From URL to signed-off handover in three steps.
            </h2>
          </Reveal>

          <div className="space-y-3">
            {[
              ["Connect", "Paste a public GitHub URL or owner/repo. We pull commits, PRs, and issues through the GitHub REST API."],
              ["Synthesize", "The engine groups activity into five pillars and attaches the exact commit, PR, or issue behind each insight."],
              ["Review", "Both engineers walk through the report, resolve open questions, add their own items, and share a permanent link."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 120}>
                <div className="group flex gap-4 rounded-2xl border border-black/[0.06] bg-white/80 p-5 hover:bg-white hover:shadow-md transition-all">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-semibold text-white group-hover:scale-110 transition-transform">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-[#6B6B67] mt-1 leading-relaxed">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal from="right" className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] shadow-xl shadow-black/5 aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/code.jpg" alt="Source code on a monitor" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] shadow-2xl shadow-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desk.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#171717]/80" />
          <div className="relative px-6 py-16 sm:py-24 text-center text-white space-y-6">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
              Run your first handover.
            </h2>
            <p className="text-white/70 max-w-lg mx-auto">
              Try a well-known open-source project in one click, or paste your own repository.
            </p>
            <Link
              href="/workspace"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#171717] hover:bg-neutral-100 transition-all hover:-translate-y-0.5"
            >
              Open the workspace
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </section>
      </Reveal>

      <p className="text-center text-[10px] text-[#A3A39E] -mt-20">Photography via Unsplash</p>
    </div>
  );
}

/* ── Small primitives ──────────────────────────────────────────── */

function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8A85] ${center ? "justify-center" : ""}`}>
      <span className="h-px w-6 bg-[#C9C9C4]" />
      {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-black/[0.08] bg-neutral-50 px-2 py-0.5 text-[11px] font-mono text-[#3F3F3C]">
      {children}
    </span>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
      </svg>
      {children}
    </span>
  );
}
