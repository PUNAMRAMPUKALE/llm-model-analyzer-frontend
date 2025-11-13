"use client";

import Link from "next/link";
import LiveLLMStream from "@/components/console/LiveLLMStream";
import PromptRunner from "@/components/console/PromptRunner";

export default function Home() {
  return (
    <main className="container-page space-y-12">
      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-2 items-start">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Dissect how LLMs behave when you turn the dials.
          </h1>
          <p className="text-mute">
            Generate response grids, evaluate with metrics, compare side-by-side,
            and export results. Designed for quick experiments and repeatable analysis.
          </p>

          <div className="flex gap-3">
            {/* <Link className="btn btn-primary" href="/experiments">Open Lab</Link> */}
             <a
    href="/experiments"
    className="btn btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
  >
    Open Lab
  </a>
            <Link className="btn" href="/docs">Docs</Link>
          </div>

          <div className="flex gap-3 text-sm">
            <span className="token">Next.js 15</span>
            <span className="token">TanStack Query</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <PromptRunner />
          </div>
          <div className="card p-4">
            <LiveLLMStream
              prompt="Explain temperature vs. top_p in 3 bullets."
              previewBlocks={[
                "• Temperature controls randomness — higher values produce diverse outputs but higher variance.",
                "• top_p (nucleus) limits candidate tokens to a cumulative probability; lower p yields safer, focused text.",
                "• Combine carefully: low temperature + moderate top_p → consistent answers; raise gradually for exploration.",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Why teams use LLM Lab</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Grid Runs", body: "Run multiple parameter combinations in one go (temperature, top_p, seed, max_tokens) and compare outputs." },
            { title: "Programmatic Metrics", body: "Coherence, redundancy, completeness, readability, structure, lexical diversity, and length adequacy." },
            { title: "Strong Picks", body: "Automatically surface the best response per batch and open its full metrics with one click." },
            { title: "Exports", body: "Download JSON/CSV for audit trails and share with your team or CI reports." },
            { title: "Streaming", body: "Follow run progress live via SSE and show output as it’s produced." },
            { title: "Friendly UX", body: "Modern theme, keyboard shortcuts, hover states, and accessible focus rings." },
          ].map((f) => (
            <div key={f.title} className="card p-4 hover:shadow-glow transition">
              <div className="text-sm font-medium mb-1">{f.title}</div>
              <p className="text-sm text-mute">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-lg font-semibold">Ready to run your first experiment?</div>
          <div className="text-sm text-mute">Point the API base to your backend and start comparing outputs.</div>
        </div>
        <Link className="btn btn-primary" href="/docs">Read the 3-minute setup</Link>
      </section>
    </main>
  );
}
