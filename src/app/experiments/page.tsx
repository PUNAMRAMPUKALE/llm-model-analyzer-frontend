"use client";

import { useExperiments } from "@/services/api";

export default function ExperimentsPage() {
  const { data = [], isLoading } = useExperiments();

  if (isLoading) {
    return <main className="container-page text-sm text-zinc-400">Loading…</main>;
  }

  if (!data.length) {
    return (
      <main className="container-page space-y-6">
        <h1 className="text-2xl font-semibold">Experiments</h1>
        <div className="card p-6">
          <p className="text-sm text-mute mb-3">
            No experiments yet. Create your first run to explore parameter effects.
          </p>
  <a className="btn" href="/">Back to Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Experiments</h1>
   <a
    href="/"
    className="btn btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
  >
    Back to Home
  </a>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((e) => (
          <a key={e.id} href={`/experiments/${e.id}`} className="card p-4 hover:shadow-glow transition block">
  <div className="text-sm font-medium mb-1">{e.title || "Untitled"}</div>
  <div className="text-xs text-zinc-400 line-clamp-2">{e.prompt}</div>

  {/* Added: createdAt in PST, AM/PM */}
  <div className="mt-2 text-[11px] text-zinc-500">
    Model: {e.model}
    <span className="mx-2">•</span>
    Created:&nbsp;
    {new Date(e.createdAt).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      hour12: true,
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}{" "}
    PST
  </div>
</a>

        ))}
      </div>
    </main>
  );
}
