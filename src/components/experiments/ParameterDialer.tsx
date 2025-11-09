"use client";

import { useState, useEffect } from "react";

type Grid = {
  temperature?: number[];
  top_p?: number[];
  max_tokens?: number[];
  samples?: number;
  seed?: number | null;
};

type Props = {
  experimentId: string;
  initial?: Grid | null | undefined;
  onChange?: (grid: Grid | undefined) => void;
};

const PRESETS = [
  { name: "Deterministic", temperature: [0.1], top_p: [0.8] },
  { name: "Balanced", temperature: [0.6], top_p: [0.9] },
  { name: "Creative", temperature: [0.9], top_p: [0.95] },
  { name: "Explore (2×2)", temperature: [0.3, 0.9], top_p: [0.8, 0.95] },
];

export function ParameterDialer({ initial, onChange }: Props) {
  const [grid, setGrid] = useState<Grid | undefined>(() => initial ?? undefined);

  useEffect(() => {
    setGrid(initial ?? undefined);
  }, [initial]);

  useEffect(() => {
    onChange?.(grid);
  }, [grid, onChange]);

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950 p-4">
      <div className="mb-2 text-sm font-medium text-zinc-200">Parameter presets</div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setGrid((g) => ({ ...(g ?? {}), ...p }))}
            className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900"
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setGrid(undefined)}
          className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          Clear override
        </button>
      </div>

      {grid && (
        <div className="mt-3 text-xs text-zinc-400">
          Using override: T=[{(grid.temperature ?? []).join(", ")}], p=[
          {(grid.top_p ?? []).join(", ")}]
        </div>
      )}
    </div>
  );
}