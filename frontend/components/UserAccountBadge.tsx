"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getStoredUser,
  updateStoredUser,
  clearStoredSession,
  type UserProfile,
} from "@/lib/api";

export default function UserAccountBadge() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editOrg, setEditOrg] = useState("");
  const [editBio, setEditBio] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    function loadUser() {
      const stored = getStoredUser();
      setUser(stored); // Only set if explicitly stored, NEVER auto-login
    }

    loadUser();
    window.addEventListener("handoveriq-auth-change", loadUser);
    return () => window.removeEventListener("handoveriq-auth-change", loadUser);
  }, []);

  // Sync edit form fields when entering edit mode
  useEffect(() => {
    if (isEditing && user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditRole(user.role || "");
      setEditOrg(user.organization || "");
      setEditBio(user.bio || "");
    }
  }, [isEditing, user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout / Sign Out
  function handleLogout() {
    clearStoredSession();
    setUser(null);
    setIsOpen(false);
    setIsEditing(false);
    router.push("/login");
  }

  // Handle Profile Picture upload
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated: UserProfile = {
        ...user,
        avatar_url: dataUrl,
      };
      setUser(updated);
      updateStoredUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      avatar_url: undefined,
    };
    setUser(updated);
    updateStoredUser(updated);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user || !editName.trim()) return;

    const updated: UserProfile = {
      ...user,
      name: editName.trim(),
      email: editEmail.trim() || user.email,
      role: editRole.trim(),
      organization: editOrg.trim(),
      bio: editBio.trim(),
    };

    setUser(updated);
    updateStoredUser(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  if (!mounted) {
    return <div className="h-8 w-20 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />;
  }

  // ── Case 1: Visitor is NOT logged in ──
  // Show clean "Sign in" & "Create account" buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-800/80 px-3.5 py-1.5 text-xs font-semibold text-[#171717] dark:text-white hover:border-[#171717] dark:hover:border-white/40 transition-all shadow-sm"
        >
          Sign in
        </Link>
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#171717] dark:bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-black dark:hover:bg-indigo-500 transition-all"
        >
          <span>Create account</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  // ── Case 2: User IS logged in ──
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Top-right Avatar Badge Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="User Account Menu"
        title={`${user.name} (${user.organization || "HandoverIQ"})`}
        className="group relative flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-zinc-900/90 p-1 pl-1 pr-2.5 shadow-sm hover:border-black/25 dark:hover:border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0 border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-[11px] font-bold text-white"
              style={{ backgroundColor: user.avatar_color || "#10b981" }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* User first name pill */}
        <span className="hidden sm:inline text-xs font-semibold text-[#171717] dark:text-zinc-100 max-w-[90px] truncate">
          {user.name.split(" ")[0]}
        </span>

        {/* Small chevron */}
        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform">
          ▾
        </span>

        {/* Active status indicator dot */}
        <span className="absolute bottom-0.5 left-6 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
      </button>

      {/* ── Popover Account Card ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0C1017] p-5 shadow-2xl animate-fadeIn z-50 text-[#171717] dark:text-zinc-100">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="mb-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-between">
              <span>✓ Profile details saved successfully</span>
            </div>
          )}

          {!isEditing ? (
            /* View Profile Mode */
            <div className="space-y-4">
              {/* Profile Avatar & Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-black/[0.06] dark:border-white/10">
                <div className="relative group/avatar h-14 w-14 rounded-full overflow-hidden shrink-0 border-2 border-emerald-500/40 shadow-sm bg-zinc-100 dark:bg-zinc-800">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: user.avatar_color || "#10b981" }}
                    >
                      {initials}
                    </div>
                  )}

                  {/* Upload overlay button */}
                  <label
                    title="Upload profile picture"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity text-[9px] font-mono font-medium"
                  >
                    <span>Change</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-bold truncate text-[#171717] dark:text-white">
                      {user.name}
                    </h3>
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold shrink-0">
                      {user.plan_tier || "Active"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </p>

                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {user.role} {user.organization ? `· ${user.organization}` : ""}
                  </p>
                </div>
              </div>

              {/* Photo Upload Controls */}
              <div className="flex items-center justify-between text-xs px-1">
                <label className="cursor-pointer text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5">
                  <span>📷 Upload Profile Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {user.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Bio snippet */}
              {user.bio && (
                <div className="rounded-xl border border-black/[0.05] dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 p-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <p className="line-clamp-2">{user.bio}</p>
                </div>
              )}

              {/* Edit Details Action */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-800 py-2 text-xs font-semibold text-[#171717] dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  ✎ Edit Profile Details
                </button>
                <Link
                  href="/workspace"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-[#171717] dark:bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-black dark:hover:bg-indigo-500 transition-colors shrink-0"
                >
                  Workspace →
                </Link>
              </div>

              {/* Navigation links & Logout Action */}
              <div className="border-t border-black/[0.06] dark:border-white/10 pt-2 flex flex-col gap-1 text-xs">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-zinc-700 dark:text-zinc-300"
                >
                  <span>My Saved Dossiers</span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {user.saved_report_ids?.length || 0}
                  </span>
                </Link>

                {/* Change Account / Switch User */}
                <Link
                  href="/login"
                  onClick={() => {
                    clearStoredSession();
                    setUser(null);
                    setIsOpen(false);
                  }}
                  className="rounded-lg px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  <span>Switch / Change Account</span>
                  <span>⇄</span>
                </Link>

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-between"
                >
                  <span>Log Out of HandoverIQ</span>
                  <span>⎋</span>
                </button>
              </div>
            </div>
          ) : (
            /* Edit Profile Mode Form */
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Edit Profile Details
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      placeholder="e.g. Lead Architect"
                      className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Team / Org
                    </label>
                    <input
                      type="text"
                      value={editOrg}
                      onChange={(e) => setEditOrg(e.target.value)}
                      placeholder="e.g. Team CodeVengers"
                      className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Bio / Status
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Short summary about your role..."
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-lg border border-black/10 dark:border-white/15 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-600 text-white py-1.5 text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
