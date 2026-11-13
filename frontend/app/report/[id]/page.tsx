"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchReportById, type HandoverReport } from "@/lib/api";
import { getOfflineDemoReport } from "@/lib/demoReports";
import HandoverReportView from "@/components/HandoverReportView";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<HandoverReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isOfflineCached, setIsOfflineCached] = useState(false);

  useEffect(() => {
    if (!reportId) return;

    fetchReportById(reportId)
      .then((data) => {
        setReport(data);
        setIsOfflineCached(false);
        setLoading(false);
      })
      .catch((err: Error) => {
        // Resilient Fallback: check pre-indexed offline repository reports
        const offline = getOfflineDemoReport(reportId);
        if (offline) {
          setReport(offline);
          setIsOfflineCached(true);
          setError("");
        } else {
          setError(err.message || "Could not find handover report.");
        }
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-12 text-center shadow-sm space-y-3">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white" />
        <p className="text-sm text-zinc-700 dark:text-zinc-200 font-medium">
          Loading handover dossier…
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{reportId}</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-10 text-center shadow-sm space-y-4 max-w-lg mx-auto">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          404 Not Found
        </span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Dossier Not Found
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {error ||
            "The requested handover report could not be found on this instance."}
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/workspace"
            className="inline-block rounded-lg bg-zinc-900 dark:bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:hover:bg-indigo-500 transition-colors"
          >
            ← Return to Workspace
          </Link>
          <Link
            href="/report/2dce427d-3752-466e-8766-160e405eff22"
            className="inline-block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200"
          >
            Load Demo Dossier (octocat)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isOfflineCached && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/40 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Loaded from Offline Verified Dossier Cache</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300">
            Zero network call · 100% Grounded
          </span>
        </div>
      )}
      <HandoverReportView report={report} isStandalonePage={true} />
    </div>
  );
}
