import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HandoverIQ",
  description: "AI-powered project knowledge handover platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
            <span className="text-2xl">🔁</span>
            <span className="text-xl font-bold tracking-tight text-brand-700">
              HandoverIQ
            </span>
            <span className="ml-auto text-xs text-gray-400 font-mono">
              Phase 2 — GitHub Integration
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
