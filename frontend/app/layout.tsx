import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/SiteHeader";
import CurvesBackground from "@/components/CurvesBackground";
import MascotGuide from "@/components/MascotGuide";
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
    <html lang="en">
      <body className="min-h-screen flex flex-col text-[#171717] antialiased selection:bg-[#171717] selection:text-white">
        <CurvesBackground />
        <SiteHeader />

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>

        <MascotGuide />

        <footer className="mt-24 border-t border-black/[0.06] bg-white/60 backdrop-blur-sm">
          {/* Team CodeVengers Showcase Banner */}
          <div className="border-b border-black/[0.08] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    CodersInPune Hackathon 2026 · Top 50 Finalist
                  </span>
                </div>
                <h4 className="text-sm font-bold tracking-tight text-white">
                  Built with passion by Team CodeVengers
                </h4>
              </div>

              {/* Team Members List - Ved Wandile 1st */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm">
                  Ved Wandile
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm">
                  Diptesh Patil
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm">
                  Prachi Patil
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shadow-sm">
                  Ritisha Songire
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div className="col-span-2 space-y-3">
              <Logo variant="lockup" heightClass="h-9" />
              <p className="text-xs text-[#6B6B67] max-w-xs leading-relaxed">
                Evidence-linked handover reports for engineering teams. Every
                insight traces back to a real commit, pull request, or issue.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#171717]">
                Product
              </p>
              <FooterLink href="/workspace">Workspace</FooterLink>
              <FooterLink href="/#pillars">Report pillars</FooterLink>
              <FooterLink href="/#how-it-works">How it works</FooterLink>
              <FooterLink href="/login">Account Portal</FooterLink>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#171717]">
                Developers
              </p>
              <FooterLink href={`${API_BASE}/docs`} external>
                API reference
              </FooterLink>
              <FooterLink href={`${API_BASE}/health`} external>
                System status
              </FooterLink>
            </div>
          </div>
          <div className="border-t border-black/[0.05]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8A8A85]">
              <span>© 2026 HandoverIQ · Built by Team CodeVengers (Ved Wandile, Diptesh Patil, Prachi Patil, Ritisha Songire)</span>
              <span>CodersInPune Hackathon 2026 · No fabricated insights</span>
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
    "block text-xs text-[#6B6B67] hover:text-[#171717] transition-colors";
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
