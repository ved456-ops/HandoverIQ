"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  fetchCurrentUser,
  getStoredUser,
  logoutAccount,
  type UserProfile,
} from "@/lib/api";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pillars", label: "Pillars" },
  { href: "/workspace", label: "Workspace" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      setUser(getStoredUser());
    };
    syncAuth();
    fetchCurrentUser()
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => {});

    window.addEventListener("handoveriq-auth-change", syncAuth);
    return () => window.removeEventListener("handoveriq-auth-change", syncAuth);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function handleSignOut() {
    await logoutAccount();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  }

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="HandoverIQ home" className="shrink-0">
          <Logo variant="lockup" heightClass="h-8 sm:h-9" />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active =
              item.href === "/workspace" && pathname?.startsWith("/workspace");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-full transition-colors ${
                  active
                    ? "text-[#171717] bg-black/[0.05] font-medium"
                    : "text-[#5F5F5B] hover:text-[#171717] hover:bg-black/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E2] bg-white pl-1.5 pr-3 py-1 text-xs font-semibold text-[#171717] shadow-sm hover:border-[#171717]/40 transition-all"
              >
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: user.avatar_color || "#171717" }}
                >
                  {initials}
                </span>
                <span className="max-w-[110px] truncate hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-[#8A8A85]">▾</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E5E5E2] bg-white p-2 shadow-xl animate-fadeIn z-50">
                  <div className="px-3 py-2.5 border-b border-[#F0EFEA]">
                    <p className="text-xs font-bold text-[#171717] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] font-mono text-[#6B6B67] truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-emerald-800">
                      {user.plan_tier}
                    </span>
                  </div>

                  <div className="py-1 flex flex-col text-xs">
                    <Link
                      href="/account"
                      className="rounded-xl px-3 py-2 text-[#171717] font-medium hover:bg-[#F4F3EF] transition-colors flex items-center justify-between"
                    >
                      <span>My Account & Dossiers</span>
                      <span className="font-mono text-[10px] text-[#8A8A85]">
                        {user.saved_report_ids.length}
                      </span>
                    </Link>
                    <Link
                      href="/workspace"
                      className="rounded-xl px-3 py-2 text-[#171717] font-medium hover:bg-[#F4F3EF] transition-colors flex items-center justify-between"
                    >
                      <span>Analyzer Workspace</span>
                      <span className="text-[#8A8A85]">→</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[#F0EFEA]">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-[#E5E5E2] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#171717] hover:border-[#171717] transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/workspace"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#171717] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black transition-all hover:-translate-y-px"
              >
                Get started
                <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-[#171717] transition-all ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-[#171717] transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-[#171717] transition-all ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] ${
          open ? "max-h-96" : "max-h-0 border-transparent"
        }`}
      >
        <nav className="px-4 py-3 flex flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2.5 text-sm text-[#3F3F3C] border-b border-black/[0.04]"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/account"
              className="py-2.5 text-sm font-semibold text-[#171717]"
            >
              My Account ({user.name})
            </Link>
          ) : (
            <Link
              href="/login"
              className="py-2.5 text-sm font-semibold text-[#171717]"
            >
              Sign in / Create Account
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
