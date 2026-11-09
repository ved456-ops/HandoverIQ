"use client";

import { useState } from "react";
import {
  type KnowledgeGap,
  updateGapStatus,
  addCustomGapToReport,
} from "@/lib/api";

type Props = {
  gaps: KnowledgeGap[];
  reportId?: string;
  onUpdate?: (updatedGaps: KnowledgeGap[]) => void;
};

export default function MissingInfoPanel({
  gaps: initialGaps,
  reportId,
  onUpdate,
}: Props) {
  const [gaps, setGaps] = useState<KnowledgeGap[]>(initialGaps);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<KnowledgeGap["category"]>("documentation");
  const [description, setDescription] = useState("");
  const [suggestedAction, setSuggestedAction] = useState("");

  async function toggleResolved(id: string) {
    const targetGap = gaps.find((g) => g.id === id);
    if (!targetGap) return;

    const newResolvedState = !targetGap.resolved;

    const updated = gaps.map((g) =>
      g.id === id ? { ...g, resolved: newResolvedState } : g
    );
    setGaps(updated);
    if (onUpdate) onUpdate(updated);

    if (reportId) {
      try {
        await updateGapStatus(reportId, id, newResolvedState);
      } catch (err) {
        console.error("Failed to sync gap status:", err);
      }
    }
  }

  async function handleAddGap(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const newGap: KnowledgeGap = {
      id: `custom-${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim(),
      suggested_action:
        suggestedAction.trim() || "Clarify with the offboarding engineer.",
      resolved: false,
      evidence: [],
    };

    if (reportId) {
      try {
        const updatedReport = await addCustomGapToReport(reportId, {
          category,
          title: newGap.title,
          description: newGap.description,
          suggested_action: newGap.suggested_action,
        });
        setGaps(updatedReport.knowledge_gaps);
        if (onUpdate) onUpdate(updatedReport.knowledge_gaps);
      } catch (err) {
        console.error("Failed to add gap:", err);
        setGaps([newGap, ...gaps]);
      }
    } else {
      setGaps([newGap, ...gaps]);
    }

    setTitle("");
    setDescription("");
    setSuggestedAction("");
    setShowAddForm(false);
    setIsSubmitting(false);
  }

  const unresolvedCount = gaps.filter((g) => !g.resolved).length;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <h3 className="font-semibold text-zinc-900 text-base tracking-tight">
            Knowledge Gaps & Handover Checklist
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-800 font-medium">
            {unresolvedCount} Pending
          </span>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {showAddForm ? "✕ Cancel" : "+ Add Review Item"}
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Blindspots and unwritten operational context to verify with the outgoing engineer before sign-off.
      </p>

      {/* Add Item Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddGap}
          className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3"
        >
          <h4 className="text-xs font-semibold text-zinc-800">
            New Offboarding Checklist Item
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Question or action title (e.g. Where are staging DB credentials?)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as KnowledgeGap["category"])
                }
                className="w-full text-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none"
              >
                <option value="documentation">Documentation</option>
                <option value="credentials">Credentials & Secrets</option>
                <option value="architecture">Architecture</option>
                <option value="operations">Operations / Deploy</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          </div>

          <textarea
            placeholder="Context explaining why this needs verification..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="Suggested resolution action (optional)"
            value={suggestedAction}
            onChange={(e) => setSuggestedAction(e.target.value)}
            className="w-full text-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="text-xs font-semibold rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 transition-colors"
          >
            {isSubmitting ? "Saving…" : "Save Checklist Item"}
          </button>
        </form>
      )}

      {/* Checklist items */}
      <div className="space-y-3">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className={`rounded-xl border p-4 transition-all ${
              gap.resolved
                ? "border-zinc-100 bg-zinc-50/50 opacity-60"
                : "border-zinc-200/80 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                    {gap.category}
                  </span>
                  <h4
                    className={`text-sm font-semibold ${
                      gap.resolved
                        ? "line-through text-zinc-400"
                        : "text-zinc-900"
                    }`}
                  >
                    {gap.title}
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {gap.description}
                </p>
              </div>

              <button
                onClick={() => toggleResolved(gap.id)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  gap.resolved
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {gap.resolved ? "✓ Resolved" : "Mark Resolved"}
              </button>
            </div>

            {gap.suggested_action && (
              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-start gap-2 text-xs text-zinc-600">
                <span className="shrink-0 font-mono text-[11px] text-indigo-600 font-semibold">
                  Action →
                </span>
                <span>{gap.suggested_action}</span>
              </div>
            )}
          </div>
        ))}

        {gaps.length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-4">
            No pending knowledge gaps recorded.
          </p>
        )}
      </div>
    </div>
  );
}
