"use client";

import { useExperiments } from "@/services/api";
import ExportCenter from "./ExportCenter";
import Link from "next/link";

export default function ExportsPage() {
  const { data = [], isLoading } = useExperiments();

  if (isLoading) {
    return <main className="container-page text-sm text-zinc-400">Loading…</main>;
  }

  if (!data.length) {
    return (
      <main className="container-page space-y-6">
<h1 className="text-2xl font-semibold flex items-center justify-between">
  <span>Exports</span>
 <a
    href="/"
    className="btn btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
  >
    Back to Home
  </a>
</h1>

      </main>
    );
  }

  return <ExportCenter />;
}
