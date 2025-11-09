// src/components/console/LiveRunConsole.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { openRunStream, type RunStreamEvent } from "@/services/stream";

export default function LiveRunConsole({ runId }: { runId?: string }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED" | "FAILED">("IDLE");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setText("");
    setStatus(runId ? "RUNNING" : "IDLE");
    if (!runId) return;

    const es = openRunStream(runId, (evt: RunStreamEvent) => {
      if (evt.type === "response.delta" && "delta" in evt) {
        setText((s) => s + (evt.delta ?? ""));
      } else if (evt.type === "completed") {
        setStatus("COMPLETED");
      } else if (evt.type === "failed") {
        setStatus("FAILED");
      }
    });

    return () => es.close();
  }, [runId]);

  // auto-scroll
  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [text]);

  if (!runId) return null;

  return (
    <div className="card p-4 space-y-2">
      <div className="text-sm text-muted-foreground">
        Live output • Run <code>{runId.slice(0, 8)}</code>{" "}
        <span className="ml-2 inline-flex items-center gap-1">
          {status === "RUNNING" && (
            <>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Running…
            </>
          )}
          {status === "COMPLETED" && <>✅ Completed</>}
          {status === "FAILED" && <>❌ Failed</>}
        </span>
      </div>
      <div
        ref={ref}
        className="min-h-[160px] max-h-[300px] overflow-auto rounded-lg bg-zinc-950/60 p-3 text-sm leading-6 ring-1 ring-zinc-800 whitespace-pre-wrap"
      >
        {text || "…"}
      </div>
    </div>
  );
}
