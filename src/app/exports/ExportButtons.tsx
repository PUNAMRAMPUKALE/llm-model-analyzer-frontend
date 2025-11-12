"use client";

import { useMemo } from "react";
import type { Experiment, ResponseRow, MetricRow } from "@/types/domain";

/* ---------- CSV helper (quotes + newlines safe) ---------- */
function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set<string>())
  );
  const esc = (x: any) => {
    const v = typeof x === "string" ? x : JSON.stringify(x ?? "");
    return `"${String(v).replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map(h => esc((row as any)[h])).join(","));
  return lines.join("\n");
}

const toPST = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        hour12: true,
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " PST"
    : "";

/* pick the best response id by highest overallQuality */
function bestFitId(metrics: MetricRow[]) {
  if (!metrics?.length) return undefined;
  return [...metrics]
    .map(m => ({ id: m.responseId, q: Number(m.overallQuality ?? 0) }))
    .sort((a, b) => b.q - a.q)[0]?.id;
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
  const bestId = useMemo(() => bestFitId(metrics || []), [metrics]);

  // ✅ Symmetric, complete rows: includes INPUT (prompt/model/time) + OUTPUT (full response text)
  const rows = useMemo(() => {
    const mBy = new Map(metrics.map(m => [m.responseId, m]));
    const createdAtPST = toPST(experiment.createdAt);

    return responses.map((r, idx) => {
      const m = mBy.get(r.id);
      return {
        /* INPUT (experiment) */
        experimentId: experiment.id,
        experimentTitle: experiment.title,
        experimentPrompt: experiment.prompt,          // ✅ full input prompt
        model: experiment.model,
        experimentCreatedAtPST: createdAtPST,

        /* RESPONSE (OUTPUT) */
        responseIndex: idx + 1,
        responseId: r.id,
        responseText: r.text ?? "",                   // ✅ full output text
        latencyMs: r.latencyMs ?? "",
        tokensIn: r.tokensIn ?? "",
        tokensOut: r.tokensOut ?? "",
        params: r.params ?? {},

        /* METRICS */
        overallQuality: m?.overallQuality ?? "",
        scores: m?.scores ?? {},
        details: m?.details ?? {},

        /* FLAGS */
        isBestFit: r.id === bestId,
      };
    });
  }, [experiment, responses, metrics, bestId]);

  const jsonBlob = () =>
    URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              exportType: "per-experiment",
              experiment: {
                id: experiment.id,
                title: experiment.title,
                prompt: experiment.prompt,             // ✅ in JSON too
                model: experiment.model,
                createdAtPST: toPST(experiment.createdAt),
              },
              results: rows,                           // CSV + JSON share same row shape
            },
            null,
            2
          ),
        ],
        { type: "application/json" }
      )
    );

  const csvBlob = () =>
    URL.createObjectURL(
      new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" })
    );

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
        onClick={() => window.print()}
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-700"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
