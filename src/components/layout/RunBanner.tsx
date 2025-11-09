"use client";

import { useRunProgress } from "@/state/runProgress";

export default function RunBanner() {
  const { activeRunId, progressed, status } = useRunProgress();
  if (!activeRunId) return null;
  const label = status === "COMPLETED" ? "Completed" : status === "FAILED" ? "Failed" : "Running…";
  const pct = Math.floor((progressed ?? 0) * 100);

  return (
    <div className="w-full bg-zinc-900 border-b border-stroke/60">
      <div className="container-page py-2 text-sm flex items-center gap-3">
        <div className="w-40 h-2 rounded bg-zinc-800 overflow-hidden">
          <div className="h-2 bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span>{label}</span>
      </div>
    </div>
  );
}
