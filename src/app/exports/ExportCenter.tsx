"use client";

import { useState } from "react";
import { useExperiments } from "@/services/api";
import type { Experiment, ResponseRow, MetricRow } from "@/types/domain";
import { fetcher } from "@/lib/fetcher";

/** Keep the same column order across CSVs */
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
type Col = (typeof COLS)[number];
type Row = Record<Col, any>;

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

/** RFC4180-ish CSV with BOM, stable columns, safe quoting */
function toCSV(rows: Row[]): string {
  const esc = (x: any) => {
    const s = typeof x === "string" ? x : JSON.stringify(x ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = COLS.join(",");
  if (!rows.length) return "\uFEFF" + head + "\n";
  const body = rows.map((r) => COLS.map((c) => esc(r[c])).join(",")).join("\n");
  return "\uFEFF" + head + "\n" + body;
}

/** Pulls all pages from a cursor endpoint. Works with Page<T> or flat arrays */
async function fetchAllPages<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined;
  while (true) {
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    qs.set("limit", "200");
    const url = `${path}${qs.toString() ? `?${qs.toString()}` : ""}`;

    const page = await fetcher<any>(url);
    if (Array.isArray(page)) {
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

function getBestFitId(metrics: MetricRow[] | undefined) {
  if (!metrics?.length) return undefined;
  return [...metrics]
    .map((m) => ({ id: m.responseId, q: Number(m.overallQuality ?? 0) }))
    .sort((a, b) => b.q - a.q)[0]?.id;
}

export default function ExportCenter() {
  const { data: experiments = [], isLoading } = useExperiments();
  const [busy, setBusy] = useState(false);
  const disabled = isLoading || busy || experiments.length === 0;

  async function downloadAllDetailedCSV() {
    if (disabled) return;

    setBusy(true);
    try {
      const allRows: Row[] = [];

      for (const e of experiments as Experiment[]) {
        // Pull full data for this experiment
        const [responses, metrics] = await Promise.all([
          fetchAllPages<ResponseRow>(`/experiments/${e.id}/responses`),
          fetchAllPages<MetricRow>(`/experiments/${e.id}/metrics`),
        ]);

        const mBy = new Map(metrics.map((m) => [m.responseId, m]));
        const bestId = getBestFitId(metrics);
        const createdAtPST = toPST(e.createdAt);

        responses.forEach((r, idx) => {
          const m = mBy.get(r.id);
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

      if (allRows.length === 0) {
        alert("No data to export yet. Create and run an experiment first.");
        return;
      }

      const csv = toCSV(allRows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all-experiments-with-outputs.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold flex items-center justify-between">
        <span>Exports</span>
        <a className="btn btn-primary" href="/">Back to Home</a>
      </h1>

      {/* Empty-state guard so we never hit the backend with no data */}
      {isLoading ? (
        <div className="text-sm text-zinc-400">Loading…</div>
      ) : experiments.length === 0 ? (
        <div className="card p-6 space-y-3">
          <p className="text-sm text-zinc-400">
            Nothing to export yet. Create and run an experiment to generate results.
          </p>
          <a className="btn btn-primary" href="/experiments">Go to Experiments</a>
        </div>
      ) : (
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
      )}
    </main>
  );
}
