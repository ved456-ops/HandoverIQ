"use client";

import { useRef, useState, useEffect } from "react";
import { askHandover, type AskResponse } from "@/lib/api";

type Msg =
  | { role: "user"; text: string }
  | { role: "assistant"; data: AskResponse }
  | { role: "error"; text: string };

const STARTERS = [
  "What are the biggest unresolved risks?",
  "Which work is still unfinished?",
  "Who owns the core modules?",
  "What are the unresolved knowledge gaps?",
  "How do I set up the project?",
];

function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") ? (
      <strong key={i} className="font-semibold text-zinc-900">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p.replace(/_/g, " ")}</span>
    )
  );
}

export default function AskHandoverChat({ reportId }: { reportId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followups, setFollowups] = useState<string[]>(STARTERS);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgs.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, loading]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const data = await askHandover(reportId, question);
      setMsgs((m) => [...m, { role: "assistant", data }]);
      if (data.suggested_followups.length) setFollowups(data.suggested_followups);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { role: "error", text: e instanceof Error ? e.message : "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-200/70 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-zinc-900 tracking-tight">Ask this Handover</h3>
          <p className="text-xs text-zinc-500">
            Answers come only from this repository&apos;s indexed commits, PRs, issues and gaps — with
            clickable citations.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold">
          Evidence-grounded
        </span>
      </div>

      <div className="px-6 py-4 space-y-4 max-h-[460px] overflow-y-auto">
        {msgs.length === 0 && (
          <p className="text-sm text-zinc-400">
            Ask anything about ownership, unfinished work, architecture, setup, risks or gaps.
          </p>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-900 text-white px-4 py-2 text-sm">
                {m.text}
              </div>
            </div>
          ) : m.role === "error" ? (
            <div key={i} className="text-sm text-red-600">
              {m.text}
            </div>
          ) : (
            <div key={i} className="max-w-[92%] space-y-2">
              <div
                className={`rounded-2xl rounded-bl-sm border px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  m.data.grounded
                    ? "bg-zinc-50 border-zinc-200 text-zinc-700"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                {renderBold(m.data.answer)}
              </div>
              {m.data.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.data.citations.map((c) => (
                    <a
                      key={c.url}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      title={c.title}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      {c.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        )}
        {loading && <div className="text-sm text-zinc-400 animate-pulse">Searching evidence…</div>}
        <div ref={endRef} />
      </div>

      <div className="px-6 pb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {followups.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this handover…"
            className="flex-1 rounded-lg border border-zinc-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
