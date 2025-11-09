// src/components/experiments/RunAction.tsx
"use client";

import { useRunExperiment, openRunStream } from "@/services/api";

type Props = {
  experimentId: string;
  /** Optional grid override coming from ParameterDialer (temperature/top_p/max_tokens arrays, etc.) */
  gridOverride?: Record<string, unknown>;
  /** Optional callback if you want to react to run start (e.g., to wire custom SSE handling) */
  onStarted?: (runId: string) => void;
};

export function RunAction({ experimentId, gridOverride, onStarted }: Props) {
  const run = useRunExperiment();

  return (
    <button
      className="btn"
      disabled={run.isPending}
      onClick={async () => {
        // Supports old usage (string) and new usage (with gridOverride)
        const res = await run.mutateAsync(
          gridOverride ? { id: experimentId, gridOverride } : experimentId
        );

        const runId = (res as any)?.runId;
        if (!runId) return;

        // Optional: let callers hook into the run start
        onStarted?.(runId);

        // Optional quick SSE wiring (no-op if callers handle it themselves)
        try {
          const es = await openRunStream(runId, () => {
            // You can update a progress store here if desired.
          });
          es.addEventListener("completed", () => es.close());
          es.addEventListener("failed", () => es.close());
        } catch {
          // ignore SSE errors to avoid blocking the UI
        }
      }}
    >
      {run.isPending ? "Starting…" : "Run"}
    </button>
  );
}
