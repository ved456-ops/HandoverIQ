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
      <strong key={i} className="font-semibold text-zinc-900 dark:text-white">
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
    <section className="rounded-2xl border border-indigo-200/70 dark:border-indigo-500/30 bg-white dark:bg-zinc-900/90 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/10 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/40 dark:to-zinc-900 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white tracking-tight">Ask this Handover</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Answers come only from this repository&apos;s indexed commits, PRs, issues and gaps — with
            clickable citations.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
          Evidence-grounded
        </span>
      </div>

      <div className="px-6 py-4 space-y-4 max-h-[460px] overflow-y-auto">
        {msgs.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Ask anything about ownership, unfinished work, architecture, setup, risks or gaps.
          </p>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-900 dark:bg-indigo-600 text-white px-4 py-2 text-sm shadow-sm">
                {m.text}
              </div>
            </div>
          ) : m.role === "error" ? (
            <div key={i} className="text-sm text-red-600 dark:text-red-400">
              {m.text}
            </div>
          ) : (
            <div key={i} className="max-w-[92%] space-y-2">
              <div
                className={`rounded-2xl rounded-bl-sm border px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  m.data.grounded
                    ? "bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                    : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300"
                }`}
              >
                {renderBold(m.data.answer)}
              </div>

              {m.data.citations && m.data.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pl-2 text-xs">
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">Sources:</span>
                  {m.data.citations.map((c, ci) => (
                    <a
                      key={ci}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 transition-colors"
                    >
                      <span>{c.type === "commit" ? "commit" : c.type}</span>
                      <strong className="text-zinc-900 dark:text-white">{c.label}</strong>
                      <span className="opacity-60 text-[10px]">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Consulting indexed repository activity…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-6 py-3 border-t border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {followups.slice(0, 4).map((f) => (
            <button
              key={f}
              type="button"
              disabled={loading}
              onClick={() => send(f)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/30 transition-all disabled:opacity-40"
            >
              {f}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask anything about this repo's handover (e.g. 'What broke in auth?')..."
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
