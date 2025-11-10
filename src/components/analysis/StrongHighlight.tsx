// frontend/src/components/analysis/StrongHighlight.tsx
"use client";

import React, { useMemo } from "react";
import type { MetricRow, ResponseRow } from "@/types/domain";

export default function StrongHighlight({
  responses = [],
  metrics = [],
  onJumpToResponse,
}: {
  responses?: ResponseRow[];
  metrics?: MetricRow[];
  onJumpToResponse?: (responseId: string) => void;
}) {
  const best = useMemo(() => {
    if (!metrics?.length) return null;
    const withQ = [...metrics]
      .map(m => ({ m, q: Number(m.overallQuality ?? 0) }))
      .sort((a, b) => b.q - a.q)[0];
    if (!withQ) return null;
    const resp = responses?.find(r => r.id === withQ.m.responseId);
    return resp ? { resp, m: withQ.m, q: withQ.q } : null;
  }, [responses, metrics]);

  if (!best) return null;

  const { resp, m, q } = best;
  const pct = Math.round(Math.max(0, Math.min(1, q ?? 0)) * 100);

  return (
    <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/10 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="text-emerald-300 font-semibold">Strong pick</div>
        <div className="text-xs text-emerald-200/80">Overall quality: <b>{pct}%</b></div>
      </div>
      <div className="mt-2 text-sm text-zinc-200 line-clamp-3">
        {resp?.text?.slice(0, 320) || "(no preview)"}{resp?.text && resp.text.length > 320 ? "…" : ""}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {Object.entries((m?.scores ?? {}) as Record<string, number>).map(([k, v]) => (
          <span key={k} className="rounded border border-emerald-700/40 bg-emerald-950/40 px-2 py-0.5">
            {k.replaceAll("_"," ")}: <b className="ml-1">{Math.round(Math.max(0, Math.min(1, Number(v))) * 100)}%</b>
          </span>
        ))}
      </div>
      <div className="mt-3">
        <button
          className="text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-white"
          onClick={() => onJumpToResponse?.(resp.id)}
        >
          Open full response
        </button>
      </div>
    </div>
  );
}
