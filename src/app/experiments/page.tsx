'use client';

import { useParams } from 'next/navigation';
import { useExperiment, useMetrics, useResponses } from '@/services/api';
import { RunAction } from '@/components/experiments/RunAction';

export default function ExperimentDetail() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);

  const { data: exp } = useExperiment(id);
  const { data: responses = [] } = useResponses(id);
  const { data: metrics = [] } = useMetrics(id);

  // lightweight loading guard (avoids flicker and undefined access)
  if (!exp) {
    return (
      <div className="p-6 text-sm text-zinc-400">
        Loading experiment…
      </div>
    );
  }

  return (
    <div className="text-[15px] leading-7">
      <main className="container-page space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{exp.title ?? 'Experiment'}</h1>
          <RunAction experimentId={id} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-4">
            <h2 className="font-medium mb-2">Prompt</h2>
            <pre className="text-sm whitespace-pre-wrap">{exp.prompt}</pre>
          </div>

          <div className="card p-4">
            <h2 className="font-medium mb-2">Parameter Grid (initial)</h2>
            <pre className="text-sm">{JSON.stringify(exp.gridSpec, null, 2)}</pre>
          </div>
        </div>

        {/* Responses */}
        <div className="card p-4">
          <h2 className="font-medium mb-2">Responses</h2>
          <ul className="space-y-4">
            {responses.map((r) => (
              <li key={r.id} className="rounded-md border border-zinc-800/70 bg-zinc-950 p-3">
                <div className="text-xs text-zinc-400 mb-1">
                  tokens: {r.tokensOut ?? 0} · latency: {r.latencyMs ?? 0} ms
                </div>
                <div className="whitespace-pre-wrap">{r.text}</div>
              </li>
            ))}
            {!responses.length && (
              <div className="text-sm text-zinc-400">No responses yet.</div>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
