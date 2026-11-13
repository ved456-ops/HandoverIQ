"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addBookmarkedRepo,
  changeAccountPassword,
  fetchAllReports,
  fetchCurrentUser,
  getStoredUser,
  loginDemoAccount,
  logoutAccount,
  removeBookmarkedRepo,
  updateAccountProfile,
  type ReportSummary,
  type UserProfile,
} from "@/lib/api";
import { relativeDate } from "@/lib/utils";

type AccountTab = "overview" | "bookmarks" | "profile" | "settings";

const AVATAR_COLORS = [
  { label: "Obsidian", value: "#171717" },
  { label: "Forest", value: "#065F46" },
  { label: "Slate Blue", value: "#1E3A8A" },
  { label: "Bronze", value: "#78350F" },
  { label: "Plum", value: "#581C87" },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const [toast, setToast] = useState<string>("");

  // Profile form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [avatarColor, setAvatarColor] = useState("#171717");
  const [savingProfile, setSavingProfile] = useState(false);

  // Preferences state
  const [aiProvider, setAiProvider] = useState("auto");
  const [exportFormat, setExportFormat] = useState("markdown");
  const [githubToken, setGithubToken] = useState("");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Bookmark form state
  const [newRepoSlug, setNewRepoSlug] = useState("");
  const [newRepoNotes, setNewRepoNotes] = useState("");
  const [addingBookmark, setAddingBookmark] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function syncFormFromUser(u: UserProfile) {
    setName(u.name);
    setRole(u.role);
    setOrganization(u.organization);
    setBio(u.bio);
    setAvatarColor(u.avatar_color || "#171717");
    setAiProvider(u.preferences.default_ai_provider || "auto");
    setExportFormat(u.preferences.export_format || "markdown");
    setEmailNotifs(u.preferences.email_notifications ?? true);
    setAutoSave(u.preferences.auto_save_dossiers ?? true);
  }

  useEffect(() => {
    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
      syncFormFromUser(cached);
    }

    Promise.all([fetchCurrentUser(), fetchAllReports()])
      .then(([freshUser, allReports]) => {
        if (freshUser) {
          setUser(freshUser);
          syncFormFromUser(freshUser);
        }
        setReports(allReports);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleQuickDemoSignIn() {
    setLoading(true);
    try {
      const session = await loginDemoAccount();
      setUser(session.user);
      syncFormFromUser(session.user);
      const allReports = await fetchAllReports();
      setReports(allReports);
      showToast("Signed in to Demo Architect Account");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await logoutAccount();
    setUser(null);
    router.push("/login");
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateAccountProfile({
        name,
        role,
        organization,
        bio,
        avatar_color: avatarColor,
      });
      setUser(updated);
      showToast("Profile & organization details saved.");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePreferences(e: FormEvent) {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const payload: Record<string, unknown> = {
        default_ai_provider: aiProvider,
        export_format: exportFormat,
        email_notifications: emailNotifs,
        auto_save_dossiers: autoSave,
      };
      if (githubToken.trim() !== "") {
        payload.github_personal_token = githubToken.trim();
      }
      const updated = await updateAccountProfile(payload);
      setUser(updated);
      setGithubToken("");
      showToast("Workspace preferences updated.");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to save preferences"
      );
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleAddBookmark(e: FormEvent) {
    e.preventDefault();
    const raw = newRepoSlug.trim();
    if (!raw) return;

    const cleanedSlug = raw
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\/+$/, "");
    if (!/^[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/.test(cleanedSlug)) {
      showToast("Enter a valid owner/repo slug or GitHub URL.");
      return;
    }

    setAddingBookmark(true);
    try {
      const updated = await addBookmarkedRepo({
        repo_name: cleanedSlug,
        repo_url: `https://github.com/${cleanedSlug}`,
        notes: newRepoNotes.trim() || "Saved for engineering handover audit",
      });
      setUser(updated);
      setNewRepoSlug("");
      setNewRepoNotes("");
      showToast(`Bookmarked ${cleanedSlug}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not add bookmark");
    } finally {
      setAddingBookmark(false);
    }
  }

  async function handleRemoveBookmark(repoName: string) {
    try {
      const updated = await removeBookmarkedRepo(repoName);
      setUser(updated);
      showToast(`Removed ${repoName} from bookmarks`);
    } catch {
      showToast("Could not remove bookmark");
    }
  }

  async function handlePasswordUpdate(e: FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      const updated = await changeAccountPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setUser(updated);
      setCurrentPassword("");
      setNewPassword("");
      showToast("Account password updated successfully.");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Password update failed"
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-14 text-center space-y-3 animate-fadeIn">
        <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#EBEBE8] dark:border-zinc-700 border-t-[#171717] dark:border-t-white" />
        <p className="text-sm font-medium text-[#171717] dark:text-white">
          Loading your HandoverIQ account workspace…
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-10 sm:p-14 text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F3EF] dark:bg-zinc-800 text-[#171717] dark:text-white font-mono font-bold text-lg">
          ID
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
            Sign in to view your account
          </h1>
          <p className="text-sm text-[#6B6B67] dark:text-zinc-400 leading-relaxed">
            Your account carries your saved handover dossiers, bookmarked
            repositories, AI engine preferences, and team audit history.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-full bg-[#171717] dark:bg-white px-6 py-2.5 text-xs font-semibold text-[#FBFBFA] dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-200 transition-all"
          >
            Sign In / Create Account →
          </Link>
          <button
            type="button"
            onClick={handleQuickDemoSignIn}
            className="rounded-full border border-[#D6D5D0] dark:border-white/20 bg-white dark:bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-[#171717] dark:text-white hover:border-[#171717] dark:hover:border-white transition-all"
          >
            Instant Demo Account
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalInsights = reports.reduce((acc, r) => acc + r.insights_count, 0);
  const totalUnresolvedGaps = reports.reduce(
    (acc, r) => acc + r.unresolved_gaps,
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Feedback Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-[#171717] dark:border-white/20 bg-[#171717] dark:bg-zinc-900 text-[#FBFBFA] dark:text-white px-5 py-3 text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-fadeIn">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Account Identity Header Card */}
      <div className="rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl tracking-tight shrink-0 shadow-md"
              style={{ backgroundColor: user.avatar_color || "#171717" }}
            >
              {initials}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
                  {user.name}
                </h1>
                <span className="rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-semibold">
                  {user.plan_tier}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A4A47] dark:text-zinc-300 font-medium">
                {user.role} ·{" "}
                <span className="text-[#6B6B67] dark:text-zinc-400">{user.organization}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8A85] dark:text-zinc-500 font-mono">
                <span>{user.email}</span>
                <span>·</span>
                <span>Active {relativeDate(user.last_login_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/workspace"
              className="rounded-full bg-[#171717] dark:bg-white px-5 py-2.5 text-xs font-semibold text-[#FBFBFA] dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-sm"
            >
              + New Repository Audit
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-[#6B6B67] dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {user.bio && (
          <p className="mt-5 pt-5 border-t border-[#F0EFEA] dark:border-white/10 text-xs sm:text-sm text-[#6B6B67] dark:text-zinc-400 max-w-3xl leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-[#F0EFEA] dark:border-white/10 flex flex-wrap items-center gap-2">
          {(
            [
              { id: "overview", label: "Overview & Dossiers" },
              {
                id: "bookmarks",
                label: `Saved Repositories (${user.bookmarked_repos.length})`,
              },
              { id: "profile", label: "Profile & Organization" },
              { id: "settings", label: "AI Engine, Keys & Security" },
            ] as { id: AccountTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-[#171717] dark:bg-white text-[#FBFBFA] dark:text-zinc-950 shadow-sm"
                  : "bg-[#F4F3EF]/80 dark:bg-zinc-800/80 text-[#6B6B67] dark:text-zinc-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#EBEAE4] dark:hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SAVED DOSSIERS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-5 shadow-sm">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A85] dark:text-zinc-400">
                Archived Dossiers
              </p>
              <p className="text-3xl font-bold font-mono text-[#171717] dark:text-white mt-1">
                {reports.length}
              </p>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-500 mt-1">
                Synced to your workspace
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-5 shadow-sm">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A85] dark:text-zinc-400">
                Bookmarked Repos
              </p>
              <p className="text-3xl font-bold font-mono text-[#171717] dark:text-white mt-1">
                {user.bookmarked_repos.length}
              </p>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-500 mt-1">
                Pinned for 1-click re-audit
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-5 shadow-sm">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A85] dark:text-zinc-400">
                Evidence Citations
              </p>
              <p className="text-3xl font-bold font-mono text-[#171717] dark:text-white mt-1">
                {totalInsights}
              </p>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-500 mt-1">
                Verified commits, PRs & issues
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm">
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Open Handover Gaps
              </p>
              <p className="text-3xl font-bold font-mono text-amber-900 dark:text-amber-200 mt-1">
                {totalUnresolvedGaps}
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1">
                Actionable checklist items
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Saved Handover Dossiers List */}
            <div className="lg:col-span-8 rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0EFEA] dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#171717] dark:text-white">
                    Your Handover Dossiers
                  </h2>
                  <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
                    5-pillar reports generated and saved under your workspace
                  </p>
                </div>
                <Link
                  href="/workspace"
                  className="text-xs font-mono font-semibold text-[#171717] dark:text-zinc-300 hover:underline"
                >
                  Generate new →
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D6D5D0] dark:border-zinc-800 p-10 text-center space-y-3">
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">
                    No handover dossiers generated yet
                  </p>
                  <p className="text-xs text-[#6B6B67] dark:text-zinc-400 max-w-md mx-auto">
                    Connect any public GitHub repository in the Analyzer
                    Workspace to synthesize your first evidence-linked dossier.
                  </p>
                  <Link
                    href="/workspace"
                    className="inline-block rounded-full bg-[#171717] dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-zinc-950"
                  >
                    Open Workspace →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <Link
                      key={r.report_id}
                      href={`/report/${r.report_id}`}
                      className="group rounded-2xl border border-[#EBEBE8] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 p-4 sm:p-5 transition-all hover:border-[#171717]/40 dark:hover:border-white/30 hover:shadow-md flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-sm text-[#171717] dark:text-white font-mono">
                            {r.repo_name}
                          </span>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-[#E5E5E2] dark:border-white/10 text-[#6B6B67] dark:text-zinc-300">
                            {r.generator}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#6B6B67] dark:text-zinc-400">
                          <span>{r.insights_count} verified insights</span>
                          <span>·</span>
                          <span
                            className={
                              r.unresolved_gaps > 0
                                ? "text-amber-700 dark:text-amber-400 font-medium"
                                : "text-emerald-700 dark:text-emerald-400 font-medium"
                            }
                          >
                            {r.unresolved_gaps} unresolved gaps
                          </span>
                          <span>·</span>
                          <span>Generated {relativeDate(r.generated_at)}</span>
                        </div>
                      </div>

                      <span className="rounded-full border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-mono font-semibold text-[#171717] dark:text-white group-hover:bg-[#171717] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-950 transition-colors shrink-0">
                        Open Dossier →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Workspace Activity Log */}
            <div className="lg:col-span-4 rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-[#F0EFEA] dark:border-white/10 pb-4">
                <h2 className="text-base font-bold text-[#171717] dark:text-white">
                  Recent Account Activity
                </h2>
                <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
                  Audit trail across your sessions
                </p>
              </div>

              <div className="space-y-4">
                {user.recent_activity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 text-xs border-b border-[#F5F5F3] dark:border-white/5 pb-3.5 last:border-none last:pb-0"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#171717] dark:bg-emerald-400 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-[#171717] dark:text-white">
                        {act.action}
                      </p>
                      <p className="font-mono text-[11px] text-[#6B6B67] dark:text-zinc-400 truncate">
                        {act.target}
                      </p>
                      <p className="text-[10px] text-[#A3A39E] dark:text-zinc-500">
                        {relativeDate(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKMARKED REPOSITORIES */}
      {activeTab === "bookmarks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-7 rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-[#F0EFEA] dark:border-white/10 pb-4">
              <h2 className="text-base font-bold text-[#171717] dark:text-white">
                Pinned GitHub Repositories
              </h2>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
                Repositories tracked by your account for ongoing handover
                readiness
              </p>
            </div>

            {user.bookmarked_repos.length === 0 ? (
              <p className="text-xs text-[#8A8A85] dark:text-zinc-500 py-6">
                No repositories bookmarked yet. Add one on the right.
              </p>
            ) : (
              <div className="space-y-3.5">
                {user.bookmarked_repos.map((bm) => (
                  <div
                    key={bm.repo_name}
                    className="rounded-2xl border border-[#EBEBE8] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={bm.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm font-bold text-[#171717] dark:text-white hover:underline"
                        >
                          {bm.repo_name} ↗
                        </a>
                      </div>
                      {bm.notes && (
                        <p className="text-xs text-[#6B6B67] dark:text-zinc-400">{bm.notes}</p>
                      )}
                      <p className="text-[10px] font-mono text-[#A3A39E] dark:text-zinc-500">
                        Added {relativeDate(bm.added_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/workspace?repo=${encodeURIComponent(
                          bm.repo_url
                        )}`}
                        className="rounded-full bg-[#171717] dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-200 transition-all"
                      >
                        Analyze Now →
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(bm.repo_name)}
                        className="rounded-full border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-[#6B6B67] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-8 shadow-sm space-y-5 h-fit">
            <div className="border-b border-[#F0EFEA] dark:border-white/10 pb-4">
              <h2 className="text-base font-bold text-[#171717] dark:text-white">
                Bookmark a Repository
              </h2>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
                Pin any public GitHub repository to your account for quick
                access
              </p>
            </div>

            <form onSubmit={handleAddBookmark} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  GitHub URL or owner/repo Slug
                </label>
                <input
                  type="text"
                  required
                  value={newRepoSlug}
                  onChange={(e) => setNewRepoSlug(e.target.value)}
                  placeholder="e.g. vercel/next.js"
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm font-mono text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  Handover Context / Notes
                </label>
                <input
                  type="text"
                  value={newRepoNotes}
                  onChange={(e) => setNewRepoNotes(e.target.value)}
                  placeholder="e.g. Q4 Frontend transition audit"
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={addingBookmark}
                className="w-full rounded-xl bg-[#171717] dark:bg-white py-2.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {addingBookmark ? "Saving…" : "+ Pin Repository to Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE & ORGANIZATION */}
      {activeTab === "profile" && (
        <div className="rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-8 shadow-sm max-w-3xl animate-fadeIn">
          <div className="border-b border-[#F0EFEA] dark:border-white/10 pb-4 mb-6">
            <h2 className="text-base font-bold text-[#171717] dark:text-white">
              Engineering Profile & Team Identity
            </h2>
            <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
              Customize how your name, role, and organization appear on
              exported handover dossiers
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  Account Email (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full rounded-xl border border-[#EBEBE8] dark:border-white/10 bg-[#F4F3EF] dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm font-mono text-[#8A8A85] dark:text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  Organization / Squad
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                Engineering Bio & Handover Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                Workspace Avatar Theme
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                      avatarColor === c.value
                        ? "border-[#171717] dark:border-white bg-[#171717]/5 dark:bg-white/10 text-[#171717] dark:text-white font-semibold"
                        : "border-[#E5E5E2] dark:border-white/10 text-[#6B6B67] dark:text-zinc-400"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: c.value }}
                    />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-full bg-[#171717] dark:bg-white px-6 py-2.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {savingProfile ? "Saving Changes…" : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: AI ENGINE, KEYS & SECURITY */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Preferences & API Configuration */}
          <div className="lg:col-span-7 rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-[#F0EFEA] dark:border-white/10 pb-4">
              <h2 className="text-base font-bold text-[#171717] dark:text-white">
                AI Synthesis & Integration Preferences
              </h2>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
                Configure your default synthesis engine, export format, and
                optional GitHub token
              </p>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                    Default Synthesis Engine
                  </label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                  >
                    <option value="auto">
                      Auto-Detect (Gemini / Claude / Deterministic)
                    </option>
                    <option value="gemini">Google Gemini 1.5 Pro</option>
                    <option value="claude">Anthropic Claude 3.5 Sonnet</option>
                    <option value="deterministic">
                      Deterministic Evidence Engine (Zero-LLM)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                    Default Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                  >
                    <option value="markdown">Markdown (.md)</option>
                    <option value="pdf_print">Print / PDF Dossier</option>
                    <option value="json">Structured JSON</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                    Personal GitHub Access Token (Optional)
                  </label>
                  {user.preferences.github_token_configured && (
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                      Configured: {user.preferences.github_token_masked}
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder={
                    user.preferences.github_token_configured
                      ? "Enter new token to replace existing…"
                      : "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  }
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm font-mono text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
                <p className="text-[11px] text-[#8A8A85] dark:text-zinc-400">
                  Increases GitHub REST API v3 rate limit from 60 req/hr to
                  5,000 req/hr for large repository audits.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D6D5D0] dark:border-zinc-700 accent-[#171717] dark:accent-emerald-400"
                  />
                  <span className="text-xs text-[#171717] dark:text-zinc-200 font-medium">
                    Automatically link generated handover dossiers to my account
                    history
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D6D5D0] dark:border-zinc-700 accent-[#171717] dark:accent-emerald-400"
                  />
                  <span className="text-xs text-[#171717] dark:text-zinc-200 font-medium">
                    Notify me when collaborators resolve handover knowledge gaps
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingPrefs}
                className="rounded-full bg-[#171717] dark:bg-white px-6 py-2.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {savingPrefs ? "Saving…" : "Save Workspace Preferences"}
              </button>
            </form>
          </div>

          {/* Password & Security Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-[#0C1017] p-6 sm:p-8 shadow-sm space-y-5 h-fit">
            <div className="border-b border-[#F0EFEA] dark:border-white/10 pb-4">
              <h2 className="text-base font-bold text-[#171717] dark:text-white">
                Account Security & Password
              </h2>
              <p className="text-xs text-[#6B6B67] dark:text-zinc-400">
                Update your workspace password
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171717] dark:text-zinc-200">
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#E5E5E2] dark:border-white/10 bg-[#FBFBFA] dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-[#171717] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#171717] dark:focus:border-white/40 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full rounded-xl border border-[#171717] dark:border-white/20 bg-white dark:bg-zinc-900 py-2.5 text-xs font-semibold text-[#171717] dark:text-white hover:bg-[#171717] dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all disabled:opacity-50"
              >
                {changingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
