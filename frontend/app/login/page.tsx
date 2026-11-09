"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  getStoredUser,
  loginAccount,
  loginDemoAccount,
  registerAccount,
} from "@/lib/api";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("alex.rivera@handoveriq.dev");
  const [password, setPassword] = useState("handover2026");
  const [role, setRole] = useState("Senior Systems Engineer");
  const [organization, setOrganization] = useState("CodeVengers Engineering");

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      router.replace("/account");
    }
  }, [router]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
    if (next === "signup") {
      setEmail("");
      setPassword("");
    } else {
      setEmail("alex.rivera@handoveriq.dev");
      setPassword("handover2026");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await loginAccount({ email, password });
      } else {
        if (name.trim().length < 2) {
          throw new Error("Please enter your full name.");
        }
        await registerAccount({
          name,
          email,
          password,
          role,
          organization,
        });
      }
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError("");
    setDemoLoading(true);
    try {
      await loginDemoAccount();
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="py-4 sm:py-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left Column: Auth Card */}
        <div className="lg:col-span-6 rounded-3xl border border-[#E5E5E2] bg-white p-7 sm:p-10 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E2] bg-[#FBFBFA] px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#6B6B67]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Workspace Identity
                </span>
                <Link
                  href="/"
                  className="text-xs text-[#6B6B67] hover:text-[#171717] transition-colors"
                >
                  ← Back to home
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] pt-2">
                {mode === "signin"
                  ? "Sign in to your workspace"
                  : "Create your HandoverIQ account"}
              </h1>
              <p className="text-sm text-[#6B6B67] leading-relaxed">
                {mode === "signin"
                  ? "Access your saved handover dossiers, bookmarked GitHub repositories, and synthesis preferences."
                  : "Set up your engineering identity to archive handover reports, bookmark repositories, and customize AI synthesis."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 rounded-xl bg-[#F4F3EF] p-1 border border-[#E5E5E2]">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  mode === "signin"
                    ? "bg-white text-[#171717] shadow-sm"
                    : "text-[#6B6B67] hover:text-[#171717]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-white text-[#171717] shadow-sm"
                    : "text-[#6B6B67] hover:text-[#171717]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Instant 1-Click Demo Login Banner */}
            <div className="rounded-2xl border border-[#E5E5E2] bg-[#FBFBFA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#171717]" />
                  Evaluating or Pitching HandoverIQ?
                </p>
                <p className="text-[11px] text-[#6B6B67]">
                  Sign in instantly as{" "}
                  <span className="font-mono text-[#171717]">
                    Alex Rivera (Staff Architect)
                  </span>{" "}
                  with preloaded dossiers & bookmarks.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading || loading}
                className="rounded-full bg-[#171717] px-4 py-2 text-xs font-semibold text-[#FBFBFA] hover:bg-black transition-all shrink-0 disabled:opacity-50"
              >
                {demoLoading ? "Entering…" : "Instant Demo Sign In →"}
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#EBEBE8] w-full" />
              <span className="bg-white px-3 text-[11px] font-mono uppercase tracking-widest text-[#8A8A85] shrink-0">
                or with credentials
              </span>
              <div className="border-t border-[#EBEBE8] w-full" />
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#171717]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full rounded-xl border border-[#E5E5E2] bg-[#FBFBFA] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#A3A39E] focus:bg-white focus:border-[#171717] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#171717]">
                      Engineering Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Tech Lead"
                      className="w-full rounded-xl border border-[#E5E5E2] bg-[#FBFBFA] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#A3A39E] focus:bg-white focus:border-[#171717] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#171717]">
                      Organization / Team
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Acme Platform"
                      className="w-full rounded-xl border border-[#E5E5E2] bg-[#FBFBFA] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#A3A39E] focus:bg-white focus:border-[#171717] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717]">
                  Work or Personal Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-[#E5E5E2] bg-[#FBFBFA] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#A3A39E] focus:bg-white focus:border-[#171717] focus:outline-none transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Password
                  </label>
                  {mode === "signin" && (
                    <span className="text-[11px] font-mono text-[#8A8A85]">
                      Demo password: handover2026
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#E5E5E2] bg-[#FBFBFA] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#A3A39E] focus:bg-white focus:border-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full rounded-xl bg-[#171717] py-3 text-sm font-semibold text-[#FBFBFA] shadow-sm hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#8A8A85] border-t-white" />
                    <span>
                      {mode === "signin"
                        ? "Signing in…"
                        : "Creating workspace…"}
                    </span>
                  </>
                ) : (
                  <span>
                    {mode === "signin"
                      ? "Sign In to HandoverIQ →"
                      : "Create Workspace Account →"}
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-[#F0EFEA] mt-6 flex items-center justify-between text-xs text-[#8A8A85]">
            <span>PBKDF2-SHA256 Encrypted</span>
            <span>Session persisted locally & on server</span>
          </div>
        </div>

        {/* Right Column: Editorial Showcase & Account Benefits */}
        <div className="lg:col-span-6 rounded-3xl border border-[#E5E5E2] bg-[#171717] text-[#FBFBFA] p-7 sm:p-10 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="bg-white/95 rounded-xl px-3 py-1.5">
                <Logo variant="lockup" heightClass="h-8" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full">
                Workspace Pro Included
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Your engineering memory, organized in one account.
              </h2>
              <p className="text-sm text-[#A3A39E] leading-relaxed">
                Every repository you analyze, every knowledge gap your team
                resolves, and your preferred AI synthesis settings stay synced to
                your personal workspace.
              </p>
            </div>

            {/* Real Editorial Photo Card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 h-52 sm:h-60">
              <img
                src="/images/pair.jpg"
                alt="Engineers collaborating on handover audit"
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                    Continuous Onboarding
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Carry your previous handover dossiers & repository audits
                    everywhere.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {[
                {
                  title: "Saved Handover Dossiers",
                  desc: "Reopen, print, or export any previously generated 5-pillar report.",
                },
                {
                  title: "Bookmarked Repositories",
                  desc: "Pin critical repositories and launch 1-click re-audits anytime.",
                },
                {
                  title: "AI Engine & Token Controls",
                  desc: "Choose Gemini, Claude, or Deterministic mode & store GitHub tokens.",
                },
                {
                  title: "Activity & Audit Timeline",
                  desc: "Track every repository audit, resolved gap, and workspace event.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#A3A39E] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#A3A39E] relative z-10">
            <span>Zero Hallucination Policy</span>
            <span>CodeVengers 2026 Official Build</span>
          </div>
        </div>
      </div>
    </div>
  );
}
