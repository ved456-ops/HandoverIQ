"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type TourStep = {
  badge: string;
  title: string;
  message: string;
  highlightTag: string;
  actionLabel?: string;
  actionHref?: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    badge: "Step 1 of 5 · Welcome",
    title: "Hey Judges & Builders! I'm Archon 👋",
    message:
      "Welcome to HandoverIQ — built by the CodeVengers team! In 20 seconds, I'll show you how we turn scattered GitHub history into a verified engineering handover dossier.",
    highlightTag: "Solves lost tribal knowledge when devs leave",
  },
  {
    badge: "Step 2 of 5 · Live GitHub Engine",
    title: "100% Real Repository Data — Zero Mockups ⚡",
    message:
      "Paste any public GitHub URL or owner/repo slug. Our FastAPI backend queries the live GitHub REST API v3 to index real commits, pull requests, and issues on the fly.",
    highlightTag: "Works on any public repo without sign-up",
    actionLabel: "See How It Works ↓",
    actionHref: "/#how-it-works",
  },
  {
    badge: "Step 3 of 5 · Zero-Hallucination AI",
    title: "The 5-Pillar Evidence-Linked Dossier 🛡️",
    message:
      "Instead of vague summaries, we synthesize 5 Pillars: Ownership, Unfinished Work, Architecture Decisions, Setup, and Risks. Every claim links directly to clickable Commit SHAs, PRs, or Issues.",
    highlightTag: "Every insight is backed by clickable GitHub proof",
    actionLabel: "Explore the 5 Pillars ↓",
    actionHref: "/#pillars",
  },
  {
    badge: "Step 4 of 5 · Actionable Workflows",
    title: "Interactive Gap Checklist & Team Accounts ✅",
    message:
      "Engineers can check off unresolved handover gaps, add custom tasks, export to Markdown/PDF, and use Accounts to carry their saved dossiers and pinned repositories everywhere.",
    highlightTag: "Persistent checklists + full SaaS account workspace",
    actionLabel: "View Account Portal →",
    actionHref: "/login",
  },
  {
    badge: "Step 5 of 5 · Judge's Test Drive",
    title: "Ready to test it live? 🚀",
    message:
      "You can jump straight into the Analyzer Workspace and test a preset repo (like tiangolo/fastapi or octocat/Hello-World) in one click, or try our Instant Demo Account!",
    highlightTag: "1-click presets ready for evaluation",
  },
];

const QUICK_FAQS = [
  {
    q: "Why is this better than a README?",
    a: "READMEs go stale fast and never show who owns which module, which PRs are half-finished, or where recent bugs clustered. HandoverIQ extracts that live from commit & PR history.",
  },
  {
    q: "How do you prevent AI hallucinations?",
    a: "Every insight in our 5-pillar schema requires an Evidence array (exact commit SHA, PR #, or Issue # with GitHub URL). Plus, our deterministic engine guarantees verified citations even without an LLM key.",
  },
  {
    q: "How should judges test this quickly?",
    a: "Click 'Open Workspace', pick one of the 1-click preset repos (e.g. octocat/Hello-World), and click 'Generate Handover Dossier'. You can also click 'Sign in' → 'Instant Demo Sign In'!",
  },
];

const STORAGE_KEY = "handoveriq_mascot_tour_dismissed_v1";

export default function MascotGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<"tour" | "faq">("tour");
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) return null;

  const currentStep = TOUR_STEPS[stepIndex];

  function handleSkipOrClose() {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  }

  function handleReopen() {
    setIsOpen(true);
  }

  function handleNext() {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      handleSkipOrClose();
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  }

  function handleNavigate(href: string) {
    if (href.startsWith("/#") && pathname === "/") {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push(href);
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Speech Bubble Card when Open */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[calc(100vw-2rem)] sm:w-[410px] rounded-3xl border border-[#171717]/15 bg-white/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] animate-fadeIn">
          {/* Top Bar: Mode Switcher + Prominent Skip Button */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F0EFEA]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode("tour");
                  setSelectedFaq(null);
                }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  mode === "tour"
                    ? "bg-[#171717] text-white"
                    : "bg-[#F4F3EF] text-[#6B6B67] hover:text-[#171717]"
                }`}
              >
                {mode === "tour" ? currentStep.badge : "Guided Tour"}
              </button>
              <button
                type="button"
                onClick={() => setMode("faq")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  mode === "faq"
                    ? "bg-[#171717] text-white"
                    : "bg-[#F4F3EF] text-[#6B6B67] hover:text-[#171717]"
                }`}
              >
                Judge Q&A
              </button>
            </div>

            <button
              type="button"
              onClick={handleSkipOrClose}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E2] bg-[#FBFBFA] px-3 py-1 text-[11px] font-semibold text-[#6B6B67] hover:border-[#171717] hover:text-[#171717] transition-all"
              title="Skip tutorial"
            >
              <span>Skip Tour</span>
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          {/* MODE 1: STEP-BY-STEP TOUR */}
          {mode === "tour" && (
            <div key={stepIndex} className="pt-4 space-y-3.5 animate-fadeIn">
              {/* Mascot + Title Row */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-b from-purple-50 to-amber-50/60 border border-purple-200/60 flex items-center justify-center p-1 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot.png"
                      alt="Archon Mascot Guide"
                      className="h-14 w-14 object-contain animate-float"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold shadow">
                    ✦
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#171717] leading-snug">
                    {currentStep.title}
                  </h3>
                  <span className="inline-block rounded-md bg-purple-50 border border-purple-200/70 px-2 py-0.5 text-[10px] font-mono font-medium text-purple-900">
                    {currentStep.highlightTag}
                  </span>
                </div>
              </div>

              {/* Main Message */}
              <p className="text-xs sm:text-[13px] text-[#4A4A47] leading-relaxed">
                {currentStep.message}
              </p>

              {/* Optional Contextual Deep-Link Action */}
              {currentStep.actionLabel && currentStep.actionHref && (
                <div>
                  <button
                    type="button"
                    onClick={() => handleNavigate(currentStep.actionHref!)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E5E2] bg-[#FBFBFA] px-3 py-1.5 text-xs font-semibold text-[#171717] hover:border-[#171717] transition-all"
                  >
                    <span>{currentStep.actionLabel}</span>
                  </button>
                </div>
              )}

              {/* Final Step Quick Launch Buttons for Judges */}
              {stepIndex === TOUR_STEPS.length - 1 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleSkipOrClose();
                      router.push("/workspace");
                    }}
                    className="rounded-xl bg-[#171717] px-3 py-2.5 text-xs font-semibold text-white hover:bg-black transition-all text-center"
                  >
                    Open Workspace →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSkipOrClose();
                      router.push("/login");
                    }}
                    className="rounded-xl border border-[#171717] bg-white px-3 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#F4F3EF] transition-all text-center"
                  >
                    Demo Account →
                  </button>
                </div>
              )}

              {/* Step Progress Dots & Navigation Controls */}
              <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between gap-2">
                {/* Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStepIndex(idx)}
                      aria-label={`Go to step ${idx + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        idx === stepIndex
                          ? "w-6 bg-[#171717]"
                          : "w-2 bg-[#D6D5D0] hover:bg-[#8A8A85]"
                      }`}
                    />
                  ))}
                </div>

                {/* Prev / Next Buttons */}
                <div className="flex items-center gap-1.5">
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="rounded-full border border-[#E5E5E2] bg-white px-3 py-1.5 text-xs font-medium text-[#4A4A47] hover:border-[#171717] hover:text-[#171717] transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full bg-[#171717] px-4 py-1.5 text-xs font-semibold text-white hover:bg-black transition-all shadow-sm"
                  >
                    {stepIndex < TOUR_STEPS.length - 1
                      ? "Next →"
                      : "Finish Tour ✓"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: JUDGE Q&A */}
          {mode === "faq" && (
            <div className="pt-4 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot.png"
                  alt="Archon Mascot"
                  className="h-12 w-12 object-contain shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-[#171717]">
                    Quick Answers for Judges
                  </p>
                  <p className="text-[11px] text-[#6B6B67]">
                    Click any question below for an instant overview:
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {QUICK_FAQS.map((item, i) => {
                  const openFaq = selectedFaq === i;
                  return (
                    <div
                      key={item.q}
                      className="rounded-2xl border border-[#E5E5E2] bg-[#FBFBFA] overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedFaq(openFaq ? null : i)}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-[#171717] flex items-center justify-between gap-2 hover:bg-white transition-colors"
                      >
                        <span>{item.q}</span>
                        <span className="text-[#8A8A85] font-mono">
                          {openFaq ? "−" : "+"}
                        </span>
                      </button>
                      {openFaq && (
                        <p className="px-3.5 pb-3 text-xs text-[#5F5F5B] leading-relaxed border-t border-[#F0EFEA] pt-2 bg-white">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#F0EFEA] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setMode("tour");
                    setStepIndex(0);
                  }}
                  className="text-xs font-semibold text-[#171717] hover:underline"
                >
                  ↺ Restart 5-Step Tour
                </button>
                <button
                  type="button"
                  onClick={handleSkipOrClose}
                  className="text-xs text-[#6B6B67] hover:text-[#171717]"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Mascot Trigger Pill (Always accessible in bottom-right) */}
      <button
        type="button"
        onClick={() => (isOpen ? handleSkipOrClose() : handleReopen())}
        className="pointer-events-auto group flex items-center gap-2.5 rounded-full border border-[#171717]/15 bg-white/95 backdrop-blur-md pl-2 pr-4 py-1.5 shadow-xl hover:shadow-2xl hover:border-[#171717] transition-all hover:-translate-y-0.5"
        aria-label="Toggle Archon Guide"
      >
        <div className="relative h-10 w-10 rounded-full bg-gradient-to-b from-purple-100 to-amber-50 border border-purple-200 flex items-center justify-center overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.png"
            alt="Archon Mascot"
            className="h-9 w-9 object-contain group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#171717]">
              {isOpen ? "Hide Guide" : "Project Tour"}
            </span>
          </div>
          <p className="text-[10px] text-[#6B6B67] font-mono">
            {isOpen ? "Click to minimize" : "Judge's 20s Guide"}
          </p>
        </div>
      </button>
    </div>
  );
}
