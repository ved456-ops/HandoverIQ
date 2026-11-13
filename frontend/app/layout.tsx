import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/SiteHeader";
import CurvesBackground from "@/components/CurvesBackground";
import MascotGuide from "@/components/MascotGuide";
import AchievementToast from "@/components/AchievementToast";
import "./globals.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://handoveriq-live-api-production.up.railway.app";

export const metadata: Metadata = {
  title: "HandoverIQ — Evidence-linked engineering handovers",
  description:
    "Turn scattered GitHub commits, pull requests, and issues into a verified, source-linked handover report.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('handoveriq-theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col text-[#171717] dark:text-[#F3F4F6] antialiased selection:bg-[#171717] selection:text-white transition-colors duration-200">
        <CurvesBackground />
        <SiteHeader />

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>

        <MascotGuide />
        <AchievementToast />

        {/* ── SLEEK DEVELOPER-GRADE FOOTER ── */}
        <footer className="mt-28 border-t border-black/[0.08] dark:border-white/10 bg-white/80 dark:bg-[#07090E]/95 backdrop-blur-xl transition-colors duration-300 print:hidden no-print">
          {/* Top Banner: Hackathon & Team CodeVengers */}
          <div className="border-b border-black/[0.06] dark:border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_70%)]" />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    CodersInPune Hackathon 2026 · Top 50 Finalist
                  </span>
                </div>
                <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 justify-center md:justify-start">
                  <span>Engineered by Team CodeVengers</span>
                </h4>
              </div>

              {/* Team Members Chips (Ved 1st) */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs font-semibold text-emerald-300 shadow-sm font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Ved Wandile
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm font-mono">
                  Diptesh Patil
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm font-mono">
                  Prachi Patil
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm font-mono">
                  Ritisha Songire
                </span>
              </div>
            </div>
          </div>

          {/* Main Footer Links & Developers Section */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            {/* Column 1: Brand Info */}
            <div className="col-span-1 sm:col-span-2 space-y-3.5 pr-4">
              <Logo variant="lockup" heightClass="h-9" />
              <p className="text-xs text-[#6B6B67] dark:text-zinc-400 max-w-sm leading-relaxed">
                Evidence-linked handover intelligence for engineering teams. Every claim,
                architectural decision, and unfinished task links to a verified Git source.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>FastAPI + Gemini / Claude Engine Online</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717] dark:text-white flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>Product</span>
              </p>
              <div className="space-y-2">
                <FooterLink href="/workspace">Workspace</FooterLink>
                <FooterLink href="/#pillars">Report pillars</FooterLink>
                <FooterLink href="/#how-it-works">How it works</FooterLink>
                <FooterLink href="/account">Account &amp; Dossiers</FooterLink>
              </div>
            </div>

            {/* Column 3: Developers (with first names: Ved, Diptesh, Prachi, Ritisha) */}
            <div className="space-y-3.5">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717] dark:text-white flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Developers</span>
              </p>

              {/* Cool Developer Badges (First Names Only, Ved 1st) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Core Engineers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "Ved", isLead: true },
                    { name: "Diptesh", isLead: false },
                    { name: "Prachi", isLead: false },
                    { name: "Ritisha", isLead: false },
                  ].map((dev) => (
                    <span
                      key={dev.name}
                      className={`inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        dev.isLead
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                          : "bg-black/[0.03] dark:bg-zinc-800/80 border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-medium hover:border-black/25 dark:hover:border-white/20"
                      }`}
                    >
                      <span className="text-[10px] text-zinc-400">@</span>
                      <span>{dev.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Developer Technical Links */}
              <div className="space-y-2 pt-1 border-t border-black/[0.05] dark:border-white/10">
                <FooterLink href={`${API_BASE}/docs`} external>
                  API reference ↗
                </FooterLink>
                <FooterLink href={`${API_BASE}/health`} external>
                  System status ↗
                </FooterLink>
                <FooterLink href="https://github.com/ved456-ops/HandoverIQ" external>
                  GitHub repository ↗
                </FooterLink>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-black/30">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8A8A85] dark:text-zinc-400 font-mono">
              <span>© 2026 HandoverIQ · Built by Team CodeVengers (Ved, Diptesh, Prachi, Ritisha)</span>
              <span>CodersInPune Hackathon 2026 · 100% Sourced Insights</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "block text-xs text-[#6B6B67] dark:text-zinc-400 hover:text-[#171717] dark:hover:text-white transition-colors";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
