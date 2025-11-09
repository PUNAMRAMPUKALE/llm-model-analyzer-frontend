"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExperiment, runExperiment } from "@/services/api";
import { useMutation } from "@tanstack/react-query";

const MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Groq: LLaMA-3.3-70B Versatile" },
  { id: "llama-3.1-8b-instant", label: "Groq: LLaMA-3.1-8B Instant" },
];

export default function PromptRunner() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("Give me 3 course suggestions for a CS beginner.");
  const [model, setModel] = useState(MODELS[0].id);
  const [preset, setPreset] = useState<"det"|"bal"|"cre"|"expl">("bal");

  const createMut = useMutation({ mutationFn: createExperiment });

  const gridByPreset = {
    det: { temperature: [0.1], top_p: [0.8], samples: 1 },
    bal: { temperature: [0.6], top_p: [0.9], samples: 1 },
    cre: { temperature: [0.9], top_p: [0.95], samples: 1 },
    expl: { temperature: [0.3, 0.9], top_p: [0.8, 0.95], samples: 1 },
  }[preset];

  async function onRun() {
    const exp = await createMut.mutateAsync({
      title: "Quick Run",
      prompt,
      model,
      gridSpec: gridByPreset,
    });
    await runExperiment({ id: exp.id, gridOverride: gridByPreset });
    router.push(`/experiments/${exp.id}`);
  }

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950 p-4">
      <div className="mb-2 text-sm font-medium text-zinc-200">Prompt</div>
      <textarea
        className="w-full rounded-xl bg-zinc-900/60 p-3 text-sm outline-none ring-1 ring-zinc-800 focus:ring-indigo-500"
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <select
          className="rounded-xl bg-zinc-900/60 p-2 text-sm outline-none ring-1 ring-zinc-800 focus:ring-indigo-500"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <PresetButton active={preset==="det"} onClick={()=>setPreset("det")} label="Deterministic" />
          <PresetButton active={preset==="bal"} onClick={()=>setPreset("bal")} label="Balanced" />
          <PresetButton active={preset==="cre"} onClick={()=>setPreset("cre")} label="Creative" />
          <PresetButton active={preset==="expl"} onClick={()=>setPreset("expl")} label="Explore" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {preset === "expl"
            ? "Runs a 2×2 grid to compare styles."
            : "One run with the selected style."}
        </div>
        <button
          onClick={onRun}
          disabled={createMut.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {createMut.isPending && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          )}
          {createMut.isPending ? "Starting..." : "Run"}
        </button>
      </div>
    </div>
  );
}

function PresetButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-lg px-3 py-1.5 text-xs " +
        (active
          ? "border border-indigo-400/60 bg-indigo-500/10 text-indigo-200"
          : "border border-zinc-700/60 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600")
      }
    >
      {label}
    </button>
  );
}
