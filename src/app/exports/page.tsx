"use client";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export default function ExportsPage() {
  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold flex items-center justify-between">
        <span>Exports</span>
        <div className="flex items-center gap-2">
          <Link className="btn" href="/">Back to Home</Link>
          <a className="btn btn-primary" href={`${API_BASE}/exports/flat.csv`}>
            Download All (CSV)
          </a>
        </div>
      </h1>

      <div className="card p-6 text-sm text-zinc-300">
        <p className="mb-2">
          This CSV contains <strong>every response</strong> across all experiments and runs,
          including <em>prompt</em>, <em>model</em>, <em>params</em>, <em>response text</em>, and
          <em>metrics</em> (overallQuality, scores, details).
        </p>
        <p className="text-zinc-400">
          If you need JSON instead, open{" "}
          <a className="link" href={`${API_BASE}/exports/flat.json`} target="_blank">/exports/flat.json</a>.
        </p>
      </div>
    </main>
  );
}
