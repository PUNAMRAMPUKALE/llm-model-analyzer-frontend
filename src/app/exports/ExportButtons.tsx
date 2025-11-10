"use client";

import { useMemo } from "react";
import type { Experiment, ResponseRow, MetricRow } from "@/types/domain";

function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set<string>())
  );
  const esc = (x: any) => {
    const v = typeof x === "string" ? x : JSON.stringify(x ?? "");
    return `"${v.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map(h => esc((row as any)[h])).join(","));
  return lines.join("\n");
}

export default function ExportButtons({
  experiment,
  responses,
  metrics,
}: {
  experiment: Experiment;
  responses: ResponseRow[];
  metrics: MetricRow[];
}) {
  const joined = useMemo(() => {
    const mBy = new Map(metrics.map(m => [m.responseId, m]));
    return responses.map(r => ({
      responseId: r.id,
      text: r.text,
      latencyMs: r.latencyMs,
      tokensIn: r.tokensIn,
      tokensOut: r.tokensOut,
      params: r.params,
      overallQuality: mBy.get(r.id)?.overallQuality ?? null,
      scores: mBy.get(r.id)?.scores ?? {},
      details: mBy.get(r.id)?.details ?? {},
    }));
  }, [responses, metrics]);

  const jsonBlob = () => URL.createObjectURL(new Blob([JSON.stringify({
    experiment, results: joined,
  }, null, 2)], { type: "application/json" }));

  const csvBlob = () => {
    const flat = joined.map(j => ({
      responseId: j.responseId,
      latencyMs: j.latencyMs,
      tokensIn: j.tokensIn,
      tokensOut: j.tokensOut,
      params: j.params,
      overallQuality: j.overallQuality,
      scores: j.scores,
      text: j.text,
    }));
    return URL.createObjectURL(new Blob([toCSV(flat)], { type: "text/csv" }));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={jsonBlob()}
        download={`experiment-${experiment.id}.json`}
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-700"
      >
        Export JSON
      </a>
      <a
        href={csvBlob()}
        download={`experiment-${experiment.id}.csv`}
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-700"
      >
        Export CSV
      </a>
      <button
        onClick={() => window.print()} // simple, reliable PDF via browser print dialog
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-700"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
