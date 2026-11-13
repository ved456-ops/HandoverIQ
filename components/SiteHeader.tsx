"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import UserAccountBadge from "@/components/UserAccountBadge";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pillars", label: "Pillars" },
  { href: "/workspace", label: "Workspace" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menus on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 dark:bg-[#07090E]/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" aria-label="HandoverIQ home" className="shrink-0 flex items-center">
            <Logo variant="lockup" heightClass="h-8 sm:h-9" />
          </Link>
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#4A4A47] dark:text-zinc-300 border border-black/[0.06] dark:border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[#8A8A85]">Team CodeVengers:</span>
            <strong className="text-[#171717] dark:text-white font-medium">Ved Wandile, Diptesh Patil, Prachi Patil, Ritisha Songire</strong>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5F5F5B] dark:text-zinc-300">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-[#171717] dark:hover:text-white ${
                  active ? "text-[#171717] dark:text-white font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Top-Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {/* Quick Workspace Link (compact) */}
          <Link
            href="/workspace"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-[#171717] dark:text-white hover:border-[#171717] dark:hover:border-white/30 transition-all shadow-sm"
          >
            <span>Workspace</span>
            <span aria-hidden="true">→</span>
          </Link>

          {/* User Account Badge with Avatar & Edit Popover */}
          <UserAccountBadge />

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-800/70"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-[#171717] dark:bg-white transition-all ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-[#171717] dark:bg-white transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-[#171717] dark:bg-white transition-all ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 ${
          open ? "max-h-96" : "max-h-0 border-transparent"
        }`}
      >
        <nav className="px-4 py-3 flex flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2.5 text-sm text-[#3F3F3C] dark:text-zinc-300 border-b border-black/[0.04] dark:border-white/5"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/workspace"
            className="py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          >
            Workspace Analyzer →
          </Link>
          <Link
            href="/account"
            className="py-2.5 text-sm font-semibold text-[#171717] dark:text-white"
          >
            Saved Dossiers &amp; Reports
          </Link>
        </nav>
      </div>
    </header>
  );
}
