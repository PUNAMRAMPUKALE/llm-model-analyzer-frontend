"use client";

import { useParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  useExperiment,
  useResponses,
  useMetrics,
  useRunExperiment,
} from "@/services/api";
import { ParameterDialer } from "@/components/experiments/ParameterDialer";
import ResponseGallery from "@/components/responses/ResponseGallery";
import ExportButtons from "../../exports/ExportButtons";
import StrongHighlight from "@/components/analysis/StrongHighlight";
import QualityInspector from "@/components/analysis/QualityInspector";
import Modal from "@/components/common/Modal";

/* ----------------------------- small helpers ----------------------------- */
function shallowMerge<T extends Record<string, any>>(a?: T, b?: T): T {
  return { ...(a ?? {}), ...(b ?? {}) } as T;
}
function deepEqual(a: any, b: any) {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
}

/* Presets (do not remove seed/other keys unless you set them here) */
const PRESETS: Record<
  string,
  | undefined
  | {
      temperature?: number[];
      top_p?: number[];
      top_k?: number[];
      max_tokens?: number[];
      presence_penalty?: number[];
      frequency_penalty?: number[];
      samples?: number;
      seed?: number | null;
    }
> = {
  Deterministic: { temperature: [0.1], top_p: [0.8], samples: 1 },
  Balanced: { temperature: [0.3], top_p: [0.9], samples: 1 },
  Creative: { temperature: [0.8], top_p: [0.95], samples: 1 },
  "Explore (2×2)": { temperature: [0.2, 0.6], top_p: [0.85, 0.95], samples: 1 },
  Strong: {
    temperature: [0.2],
    top_p: [0.85],
    max_tokens: [3500],
    presence_penalty: [0],
    frequency_penalty: [0],
  },
  "Clear override": undefined,
};

/* Print helper: clones dialog content into a print window (Save as PDF) */
// utils/print.ts (or inline in the page file)
export function printElementAsPDF(el: HTMLElement | null, title = "Response Details") {
  if (!el) return;

  // Copy current content (outerHTML preserves basic structure)
  const contentHTML = el.outerHTML || el.innerHTML || "";

  // Minimal inline styles so content is readable (no Tailwind in new window)
  const styles = `
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial;
         background:#fff;color:#111;padding:24px;margin:0;}
    .card{border:1px solid #e5e7eb;border-radius:8px;padding:12px;}
    h1,h2,h3{margin:0 0 10px 0}
    pre{white-space:pre-wrap;word-break:break-word}
    code{white-space:pre-wrap}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #e5e7eb;padding:6px;text-align:left}
    .muted{color:#555}
    @media print { .no-print { display:none !important; } }
  `;

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${contentHTML}
        <script>
          window.addEventListener('load', function() {
            // Give layout a tick to settle, then print and close
            setTimeout(function(){
              try { window.print(); } catch(e){}
              setTimeout(function(){ window.close(); }, 300);
            }, 80);
          });
        <\/script>
      </body>
    </html>
  `;

  // Blob → URL avoids document.write race & popup blockers are friendlier
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer,width=1024,height=768");
  // If popup blocked, tell the user
  if (!w) alert("Please allow pop-ups to download the PDF.");
}


/* Find best-fit responseId by highest overallQuality */
function getBestFitId(metrics: Array<{ responseId: string; overallQuality?: number }>): string | null {
  if (!metrics?.length) return null;
  const best = [...metrics]
    .map(m => ({ id: m.responseId, q: Number(m.overallQuality ?? 0) }))
    .sort((a, b) => b.q - a.q)[0];
  return best?.id ?? null;
}

export default function ExperimentDetail() {
  const params = useParams();
  const raw = (params as any)?.id as string | string[] | undefined;
  const id = Array.isArray(raw) ? raw[0] : raw ?? "";

  const { data: exp, isLoading: expLoading } = useExperiment(id, { enabled: !!id });
  const { data: responses = [], isLoading: respLoading } = useResponses(id, { enabled: !!id });
  const { data: metrics = [], isLoading: metLoading } = useMetrics(id, { enabled: !!id });

  const runMut = useRunExperiment();

  const [gridOverride, setGridOverride] = useState<any | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [openResponseId, setOpenResponseId] = useState<string | null>(null);
  const lastSentRef = useRef<string>("");

  const title = expLoading ? "Loading…" : exp?.title ?? "Experiment";
  const canRun = !!id && !runMut.isPending;

  const handleDialerChange = useCallback((g: any) => {
    setActivePreset(null);
    setGridOverride((prev: any) => (deepEqual(prev, g) ? prev : g));
  }, []);

  const onChoosePreset = (name: string) => {
    const preset = PRESETS[name];
    setActivePreset(name);
    setGridOverride(preset ? { ...preset } : undefined);
  };

  const currentGrid = useMemo(() => {
    const base = (exp?.gridSpec as any) ?? {};
    return shallowMerge(base, gridOverride);
  }, [exp?.gridSpec, gridOverride]);

  const runNow = async () => {
    try {
      const payload = gridOverride ? { id, gridOverride } : id;
      lastSentRef.current = JSON.stringify(gridOverride ?? {});
      await runMut.mutateAsync(payload as any);
    } catch (e) {
      console.error("Run failed:", e);
      alert("Run failed. Check console/server logs.");
    }
  };

  const gridInfo = useMemo(() => {
    if (!gridOverride) return "Using initial grid from experiment.";
    return `Using override: ${JSON.stringify(gridOverride)}`;
  }, [gridOverride]);

  /* Modal handlers */
  const openFromStrong = (rid: string) => setOpenResponseId(rid);
  const closeModal = () => setOpenResponseId(null);

  const focusedResponse = useMemo(
    () => responses.find((r) => r.id === openResponseId) ?? null,
    [responses, openResponseId]
  );

  const bestFitId = useMemo(() => getBestFitId(metrics), [metrics]);
  const isViewingBestFit = useMemo(
    () => !!openResponseId && openResponseId === bestFitId,
    [openResponseId, bestFitId]
  );

  const handleDownloadPdf = useCallback(
    (contentEl: HTMLElement | null) => {
      const safeTitle = focusedResponse
        ? `BestFit_${isViewingBestFit ? "Yes" : "No"}_${focusedResponse.id.slice(0, 8)}`
        : "Response_Details";
      printElementAsPDF(contentEl, safeTitle);
    },
    [focusedResponse, isViewingBestFit]
  );

  /* -------------------------------- render -------------------------------- */

  return (
    <main className="container-page space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-zinc-400">
            {gridInfo}
            {exp?.model ? ` • model ${exp.model}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runNow}
            disabled={!canRun}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 active:translate-y-px disabled:opacity-50"
          >
            {runMut.isPending ? "Running…" : "Run"}
          </button>

          {/* NEW: Open Best Fit (opens dialog on highest-quality response) */}
          <button
            onClick={() => { if (bestFitId) setOpenResponseId(bestFitId); }}
            disabled={!bestFitId}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            title={bestFitId ? "Open the best-fit response dialog" : "No responses evaluated yet"}
          >
            Open Best Fit
          </button>
        </div>
      </div>

      {/* Prompt + Current Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-medium mb-2">Prompt</h2>
          <pre className="text-sm whitespace-pre-wrap">{exp?.prompt ?? "—"}</pre>
        </div>
        <div className="card p-4">
          <h2 className="font-medium mb-2">Parameter Grid (current)</h2>
          <pre className="text-sm break-all">
            {JSON.stringify(currentGrid ?? {}, null, 2)}
          </pre>
        </div>
      </div>

{/* Presets row (stable layout + clear active state) */}
<div className="card p-3">
  <div className="text-sm font-medium mb-2">Parameter presets</div>
  <div className="flex flex-wrap items-center gap-2 min-w-0">
    {Object.keys(PRESETS).map((name) => {
      const isActive = activePreset === name && name !== "Clear override";

      const clsBase =
        "inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm " +
        "transition-[color,background,border,transform,box-shadow] will-change-auto select-none " +
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:translate-y-px";

      const clsActive =
        name === "Strong"
          ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
          : "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.25)]";

      const clsIdle =
        "bg-zinc-900/40 text-zinc-200 border-zinc-700 hover:bg-zinc-800/60";

      const clsClear =
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm " +
        "border border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800/60";

      return name === "Clear override" ? (
        <button
          key={name}
          className={clsClear}
          onClick={() => onChoosePreset(name)}
          aria-pressed={false}
        >
          {name}
        </button>
      ) : (
        <button
          key={name}
          className={`${clsBase} ${isActive ? clsActive : clsIdle}`}
          onClick={() => onChoosePreset(name)}
          aria-pressed={isActive}
        >
          {name}
        </button>
      );
    })}
  </div>
  <div className="mt-2 text-xs text-zinc-400">
    Using override: {gridOverride ? JSON.stringify(gridOverride) : "—"}
  </div>
</div>

      {/* <ParameterDialer
        experimentId={id}
        initial={exp?.gridSpec as any}
        onChange={handleDialerChange}
      /> */}

      {/* Strong pick BEFORE Responses (clicking opens modal) */}
      <StrongHighlight
        responses={responses}
        metrics={metrics}
        onJumpToResponse={openFromStrong}
      />

      {/* Summary row with export */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {respLoading ? "Loading responses…" : `${responses.length} responses`}
          {metLoading ? "" : ` • ${metrics.length} metric rows`}
        </div>
        {exp && (
          <ExportButtons experiment={exp as any} responses={responses} metrics={metrics} />
        )}
      </div>

      {/* Responses */}
      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Responses</h2>
          <div className="text-xs text-zinc-400">
            {Array.isArray(responses) ? responses.length : 0} items
          </div>
        </div>
        <ResponseGallery responses={responses} loading={respLoading} metrics={metrics} />
      </section>

      {/* Modal: full response + metrics inspector + Download PDF */}
      <Modal
        open={!!openResponseId}
        title={
          focusedResponse
            ? `${isViewingBestFit ? "Best Fit — " : ""}Response ${focusedResponse.id.slice(0, 6)}…`
            : "Details"
        }
        onClose={closeModal}
        onDownload={handleDownloadPdf}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-sm font-medium mb-2 text-zinc-200">Full response</div>
            <pre className="text-sm whitespace-pre-wrap text-zinc-100">
              {focusedResponse?.text ?? "(not found)"}
            </pre>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
            <QualityInspector
              responses={responses}
              metrics={metrics}
              focusId={openResponseId ?? ""}
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}
