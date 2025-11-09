"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateExperiment } from "@/services/api";

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

const schema = z.object({
  title: z.string().min(2),
  prompt: z.string().min(5),
  model: z.string().min(1),
  temperature: z.string().default("0.0,0.3,0.6,0.9"),
  top_p: z.string().default("0.7,0.9"),
  samples: z.coerce.number().min(1).max(5).default(1),
});

export function NewExperimentForm() {
  const { mutateAsync, isPending } = useCreateExperiment();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Studio Smoke",
      prompt: "Explain temperature and top_p in 3 bullets.",
      model: DEFAULT_GROQ_MODEL, // ✅ Groq by default
      temperature: "0.0,0.3,0.6,0.9",
      top_p: "0.7,0.9",
      samples: 1,
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (v) => {
        const gridSpec = {
          temperature: v.temperature.split(",").map(Number),
          top_p: v.top_p.split(",").map(Number),
          samples: v.samples,
        };
        await mutateAsync({
          title: v.title,
          prompt: v.prompt,
          model: v.model,
          gridSpec,
        });
      })}
    >
      <div className="space-y-1">
        <label className="label">Title</label>
        <input className="input" placeholder="My experiment" {...register("title")} />
        {errors.title && <p className="text-xs text-red-400">{String(errors.title.message)}</p>}
      </div>

      <div className="space-y-1">
        <label className="label">Prompt</label>
        <textarea className="textarea h-32" placeholder="Your prompt..." {...register("prompt")} />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="label">Model (Groq)</label>
          <input
            className="input"
            placeholder={DEFAULT_GROQ_MODEL}
            {...register("model")}
          />
        </div>
        <div className="space-y-1">
          <label className="label">temperature (csv)</label>
          <input className="input" placeholder="0.0,0.3,0.6,0.9" {...register("temperature")} />
        </div>
        <div className="space-y-1">
          <label className="label">top_p (csv)</label>
          <input className="input" placeholder="0.7,0.9" {...register("top_p")} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="label">samples</label>
          <input
            type="number"
            className="input"
            min={1}
            max={5}
            {...register("samples", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="pt-2">
        <button className="btn btn-primary" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
