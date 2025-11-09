// src/services/stream.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export type RunStreamEvent =
  | { type: "response.delta"; runId: string; delta: string }
  | { type: "progress"; runId: string }
  | { type: "completed"; runId: string }
  | { type: "failed"; runId: string }
  | { type: "end" };

export function openRunStream(
  runId: string,
  onEvent: (evt: RunStreamEvent) => void
): EventSource {
  const es = new EventSource(`${API_BASE}/runs/${runId}/stream`);
  const dispatch = (type: RunStreamEvent["type"]) => (e: MessageEvent) => {
    try {
      const payload = JSON.parse(e.data || "{}");
      onEvent({ type, ...payload });
    } catch {
      onEvent({ type } as any);
    }
  };

  // default message (if server uses onmessage)
  es.onmessage = dispatch("progress");
  es.addEventListener("response.delta", dispatch("response.delta"));
  es.addEventListener("progress", dispatch("progress"));
  es.addEventListener("completed", dispatch("completed"));
  es.addEventListener("failed", dispatch("failed"));
  es.addEventListener("end", dispatch("end"));
  return es;
}
