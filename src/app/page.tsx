// src/app/page.tsx
"use client";

import Link from "next/link";
import LiveLLMStream from "@/components/console/LiveLLMStream";
import PromptRunner from "@/components/console/PromptRunner";

export default function Home() {
  return (
    <main className="container-page space-y-10">
      <section className="grid gap-8 md:grid-cols-2 items-start">
        {/* Left: Hero copy + CTAs */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Dissect how LLMs behave when you turn the dials.
          </h1>
          <p className="text-mute">
            Explore temperature, top_p, and sampling strategies. Generate grids of responses,
            evaluate with objective metrics, compare, and export — all in one polished lab.
          </p>

          <div className="flex gap-3">
            <Link className="btn btn-primary" href="/experiments">Open Lab</Link>
            <Link className="btn" href="/docs">Docs</Link>
          </div>

          <div className="flex gap-3 text-sm">
            <span className="token">SSR</span>
            <span className="token">TanStack Query</span>
            <span className="token">Recharts</span>
          </div>
        </div>

        {/* Right: interactive console panel */}
        <div className="space-y-4">
          <div className="card p-4">
            <PromptRunner />
          </div>

          <div className="card p-4">
            <LiveLLMStream
              prompt="Explain temperature vs. top_p in 3 bullets."
              previewBlocks={[
                "• Temperature controls randomness — higher values produce diverse outputs but higher variance.",
                "• top_p (nucleus) limits candidate tokens to a cumulative probability; lower p yields safer, more focused text.",
                "• Combine carefully: low temperature + moderate top_p → consistent, coherent answers; increase gradually for exploration.",
              ]}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
