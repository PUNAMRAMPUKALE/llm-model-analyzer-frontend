"use client";
import { useExperiments } from "@/services/api";
import Link from "next/link";

export default function ExportsPage() {
  const { data = [], isLoading } = useExperiments();

  if (isLoading) return <main className="container-page text-sm text-zinc-400">Loading…</main>;

  if (!data.length) {
    return (
      <main className="container-page space-y-6">
        <h1 className="text-2xl font-semibold flex items-center justify-between">
          <span>Exports</span>
          <a className="btn" href="/">Back to Home</a>
        </h1>

        <div className="card p-6">
          <p className="text-sm text-zinc-400 mb-3">
            Nothing to export yet. Create and run an experiment to generate results.
          </p>
          <Link className="btn btn-primary" href="/experiments">Go to Experiments</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold flex items-center justify-between">
        <span>Exports</span>
        <a className="btn" href="/">Back to Home</a>
      </h1>

      {/* Only show the download control when we actually have rows */}
      <a
        className="btn btn-primary"
        href={`${process.env.NEXT_PUBLIC_API_BASE}/exports/flat.csv`}
      >
        Download All Experiments (CSV)
      </a>
    </main>
  );
}
