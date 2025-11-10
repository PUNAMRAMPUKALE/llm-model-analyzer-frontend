"use client";

import { useMemo, useState } from "react";
import type { ResponseRow, MetricRow } from "@/types/domain";
import QualityInspector from "@/components/analysis/QualityInspector";

type Props = {
  responses: ResponseRow[] | undefined;
  loading?: boolean;
  metrics?: MetricRow[];
};

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-300">
      {label}
    </span>
  );
}

export default function ResponseGallery({ responses, loading, metrics }: Props) {
  const [selected, setSelected] = useState<ResponseRow | null>(null);
  const items = useMemo(() => (Array.isArray(responses) ? responses : []), [responses]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <div className="mb-3 h-4 w-24 rounded bg-zinc-800" />
            <div className="mb-2 h-3 w-36 rounded bg-zinc-800" />
            <div className="h-24 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
        No responses yet. Click <b>Run</b> to generate results.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((r, idx) => {
          const p = (r.params as any) ?? {};
          const T = p.temperature ?? "—";
          const P = p.top_p ?? "—";
          const tokensIn = r.tokensIn ?? 0;
          const tokensOut = r.tokensOut ?? 0;

          return (
            <button
              key={r.id ?? idx}
              onClick={() => setSelected(r)}
              className="group rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 text-left ring-1 ring-transparent transition hover:border-zinc-700/70 hover:ring-indigo-500/20"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-zinc-400">#{idx + 1}</div>
                <div className="text-xs text-zinc-400">{r.latencyMs ?? 0} ms</div>
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                <Chip label={`T=${T}`} />
                <Chip label={`p=${P}`} />
                <Chip label={`in ${tokensIn} / out ${tokensOut}`} />
              </div>

              <div className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                {r.text ?? ""}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl border border-zinc-800/70 bg-zinc-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="text-sm font-medium text-zinc-200">Response details</div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <Chip label={`T=${(selected.params as any)?.temperature ?? "—"}`} />
              <Chip label={`p=${(selected.params as any)?.top_p ?? "—"}`} />
              <Chip label={`latency ${selected.latencyMs ?? 0} ms`} />
              <Chip label={`in ${selected.tokensIn ?? 0} / out ${selected.tokensOut ?? 0}`} />
            </div>

            <pre className="whitespace-pre-wrap rounded-xl bg-zinc-900/60 p-4 text-sm leading-relaxed text-zinc-100">
              {selected.text ?? ""}
            </pre>

            {/* NEW: PDF-required evaluation sections */}
            <div className="mt-4">
              <QualityInspector
                responses={items}
                metrics={metrics ?? []}
                focusId={selected.id}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
