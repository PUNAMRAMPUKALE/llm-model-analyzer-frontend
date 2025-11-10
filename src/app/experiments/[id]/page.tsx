"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  useExperiment,
  useResponses,
  useMetrics,
  useRunExperiment,
} from "@/services/api";
import { ParameterDialer } from "@/components/experiments/ParameterDialer";
import ResponseGallery from "@/components/responses/ResponseGallery";
import ExportButtons from "../../exports/ExportButtons";

export default function ExperimentDetail() {
  const params = useParams();
  const raw = (params as any)?.id as string | string[] | undefined;
  const id = Array.isArray(raw) ? raw[0] : raw ?? "";

  const { data: exp, isLoading: expLoading } = useExperiment(id, { enabled: !!id });
  const { data: responses = [], isLoading: respLoading } = useResponses(id, { enabled: !!id });
  const { data: metrics = [], isLoading: metLoading } = useMetrics(id, { enabled: !!id });

  const runMut = useRunExperiment();

  const [gridOverride, setGridOverride] = useState<any | undefined>(undefined);
  const lastSentRef = useRef<string>("");

  const title = expLoading ? "Loading…" : exp?.title ?? "Experiment";
  const canRun = !!id && !runMut.isPending;

  const runNow = async () => {
    const payload = gridOverride ? { id, gridOverride } : id;
    lastSentRef.current = JSON.stringify(gridOverride ?? {});
    await runMut.mutateAsync(payload as any);
  };

  const gridInfo = useMemo(() => {
    if (!gridOverride) return "Using initial grid from experiment.";
    return `Using override: ${JSON.stringify(gridOverride)}`;
  }, [gridOverride]);

  return (
    <main className="container-page space-y-6 min-w-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-zinc-400">
            {gridInfo}
            {exp?.model ? ` • model ${exp.model}` : ""}
          </p>
        </div>

        <button
          onClick={runNow}
          disabled={!canRun}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 active:translate-y-px disabled:opacity-50"
        >
          {runMut.isPending ? "Running…" : "Run"}
        </button>
      </div>

      {/* Prompt + Initial Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-medium mb-2">Prompt</h2>
          <pre className="text-sm whitespace-pre-wrap">{exp?.prompt ?? "—"}</pre>
        </div>
        <div className="card p-4">
          <h2 className="font-medium mb-2">Parameter Grid (initial)</h2>
          <pre className="text-sm break-all">
            {JSON.stringify(exp?.gridSpec ?? {}, null, 2)}
          </pre>
        </div>
      </div>

      {/* Dialer (override) */}
      <ParameterDialer
        experimentId={id}
        initial={exp?.gridSpec as any}
        onChange={(g) => setGridOverride(g)}
      />

      {/* Summary row with export */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {respLoading ? "Loading responses…" : `${responses.length} responses`}
          {metLoading ? "" : ` • ${metrics.length} metric rows`}
        </div>
        {exp && (
          <ExportButtons
            experiment={exp as any}
            responses={responses}
            metrics={metrics}
          />
        )}
      </div>

      {/* Responses + modal evaluation */}
      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Responses</h2>
          <div className="text-xs text-zinc-400">
            {Array.isArray(responses) ? responses.length : 0} items
          </div>
        </div>
        <ResponseGallery
          responses={responses}
          loading={respLoading}
          metrics={metrics}
        />
      </section>
    </main>
  );
}
