"use client";

import Link from "next/link";
import { useExperiments } from "@/services/api";

export default function ExperimentsListPage() {
  const { data = [], isLoading } = useExperiments({ staleTime: 10_000 });

  if (isLoading) {
    return <main className="container-page text-sm text-zinc-400">Loading…</main>;
  }

  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold flex items-center justify-between">
        <span>Experiments</span>
        <a className="btn" href="/">Back to Home</a>
      </h1>

      <section className="grid md:grid-cols-2 gap-6">
        {data.map(exp => (
          <Link
            key={exp.id}
            href={`/experiments/${exp.id}`}
            className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:bg-zinc-900 transition"
          >
            <div className="text-lg font-semibold text-zinc-100 line-clamp-1">
              {exp.title}
            </div>
            <p className="mt-2 text-sm text-zinc-300 line-clamp-2">{exp.prompt}</p>
            <div className="mt-3 text-xs text-zinc-500 flex items-center gap-3">
              <span>Model: {exp.model}</span>
              <span>•</span>
              <span>
                Created: {new Date(exp.createdAt).toLocaleString("en-US", {
                  timeZone: "America/Los_Angeles",
                  hour12: true
                })}{" "}PST
              </span>
            </div>
          </Link>
        ))}

        {!data.length && (
          <div className="card p-6 text-sm text-zinc-400">
            No experiments yet. Open any detail link from your runs page to execute.
          </div>
        )}
      </section>
    </main>
  );
}
