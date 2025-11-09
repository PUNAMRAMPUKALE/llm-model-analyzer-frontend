'use client';

import { exportCSV } from '@/lib/csv';
import { useExperiments } from '@/services/api';
import type { Experiment } from '@/types/domain';

export default function ExportCenter() {
  const { data: experiments = [] } = useExperiments();

  const rows = (experiments as Experiment[]).map((e) => ({
    id: e.id,
    title: e.title,
    model: e.model,
    prompt: e.prompt,
    gridSpec: e.gridSpec,
    createdAt: e.createdAt,
  }));

  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold">Exports</h1>
      <div className="card p-4">
        <button
          className="btn"
          onClick={() => exportCSV('experiments.csv', rows)}
        >
          Download Experiments CSV
        </button>
      </div>
    </main>
  );
}
