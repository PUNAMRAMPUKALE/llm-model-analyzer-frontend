"use client";

import { useState } from "react";
import { useExperiments } from "@/services/api";
import type { Experiment, ResponseRow, MetricRow } from "@/types/domain";
import { fetcher } from "@/lib/fetcher";

/* ---------- Force identical columns across CSVs (matches per-experiment) ---------- */
const COLS = [
  "experimentId",
  "experimentTitle",
  "experimentPrompt",
  "model",
  "experimentCreatedAtPST",
  "responseIndex",
  "responseId",
  "responseText",
  "tokensIn",
  "tokensOut",
  "latencyMs",
  "params",
  "overallQuality",
  "scores",
  "details",
  "isBestFit",
] as const;
type Row = Record<(typeof COLS)[number], any>;

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

/* Simple CSV with BOM, stable order, safe quoting */
function toCSV(rows: Row[]): string {
  if (!rows.length) return "\uFEFF" + COLS.join(",") + "\n";
  const esc = (x: any) => {
    const s = typeof x === "string" ? x : JSON.stringify(x ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = COLS.join(",");
  const body = rows.map(r => COLS.map(c => esc(r[c])).join(",")).join("\n");
  return "\uFEFF" + head + "\n" + body;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined = undefined;
  while (true) {
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    // use a reasonable page size if your backend supports it
    qs.set("limit", "200");
    const url = `${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
    const page = await fetcher<any>(url);
    if (Array.isArray(page)) {
      // Some endpoints may return a flat array
      out.push(...page);
      break;
    } else if (page?.data) {
      out.push(...page.data);
      if (page.nextCursor) {
        cursor = page.nextCursor;
        continue;
      }
      break;
    } else {
      break;
    }
  }
  return out;
}

function bestFitId(metrics: MetricRow[]) {
  if (!metrics?.length) return undefined;
  return [...metrics]
    .map(m => ({ id: m.responseId, q: Number(m.overallQuality ?? 0) }))
    .sort((a, b) => b.q - a.q)[0]?.id;
}

export default function ExportCenter() {
  const { data: experiments = [], isLoading } = useExperiments();
  const [busy, setBusy] = useState(false);
  const disabled = isLoading || experiments.length === 0 || busy;

  async function downloadAllDetailedCSV() {
    try {
      setBusy(true);

      const allRows: Row[] = [];

      for (const e of experiments as Experiment[]) {
        // Pull *all* responses & metrics for each experiment (with pagination support)
        const [responses, metrics] = await Promise.all([
          fetchAllPages<ResponseRow>(`/experiments/${e.id}/responses`),
          fetchAllPages<MetricRow>(`/experiments/${e.id}/metrics`),
        ]);

        const mBy = new Map(metrics.map(m => [m.responseId, m]));
        const createdAtPST = toPST(e.createdAt);
        const bestId = bestFitId(metrics);

        responses.forEach((r, idx) => {
          const m = mBy.get(r.id);
          // Support both r.text and r.content just in case
          const responseText = (r as any).text ?? (r as any).content ?? "";

          const row: Row = {
            experimentId: e.id,
            experimentTitle: e.title,
            experimentPrompt: e.prompt,
            model: e.model,
            experimentCreatedAtPST: createdAtPST,

            responseIndex: idx + 1,
            responseId: r.id,
            responseText,

            tokensIn: r.tokensIn ?? "",
            tokensOut: r.tokensOut ?? "",
            latencyMs: r.latencyMs ?? "",
            params: r.params ?? {},

            overallQuality: m?.overallQuality ?? "",
            scores: m?.scores ?? {},
            details: m?.details ?? {},

            isBestFit: r.id === bestId,
          };

          allRows.push(row);
        });
      }

      const csv = toCSV(allRows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all-experiments-with-outputs.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold flex items-center justify-between">
        <span>Exports</span>
        <a
          href="/"
          className="btn btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
        >
          Back to Home
        </a>
      </h1>

      <div className="card p-4 space-y-3">
        <p className="text-sm text-mute">
          Download a combined CSV with <b>inputs</b> (title, prompt, model, PST time) and <b>outputs</b> (response text, tokens, latency, params, metrics) for every experiment.
        </p>

        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={downloadAllDetailedCSV}
          title={disabled ? "No experiments or still preparing…" : "Export all results with outputs"}
        >
          {busy ? "Preparing…" : "Download All Results CSV"}
        </button>
      </div>
    </main>
  );
}
