"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Experiment, ResponseRow, MetricRow } from "@/types/domain";

export type { Experiment, ResponseRow, MetricRow };

/** Public API base (override with NEXT_PUBLIC_API_BASE in .env.local) */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

/* --------------------------------- HTTP ---------------------------------- */

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (r.status === 204) return [] as unknown as T;
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json() as Promise<T>;
}

async function postJSON<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`POST ${path} -> ${r.status} ${t}`);
  }
  return r.json() as Promise<T>;
}

/* ------------------------------- Types/body ------------------------------ */

export type GridSpec = {
  temperature?: number[];
  top_p?: number[];
  top_k?: number[];
  max_tokens?: number[];
  samples?: number;
  seed?: number | null;
};

export type CreateExperimentBody = Pick<Experiment, "title" | "prompt" | "model"> & {
  gridSpec: GridSpec;
};

/* --------------------------- Sanitize helpers ---------------------------- */

function sanitizeGrid(input: any): GridSpec {
  if (!input || typeof input !== "object") return {};
  const out: GridSpec = {};
  if (Array.isArray(input.temperature)) out.temperature = input.temperature;
  if (Array.isArray(input.top_p)) out.top_p = input.top_p;
  if (Array.isArray(input.top_k)) out.top_k = input.top_k;
  if (Array.isArray(input.max_tokens)) out.max_tokens = input.max_tokens;
  if (typeof input.samples === "number") out.samples = input.samples;
  if (typeof input.seed === "number" || input?.seed === null) out.seed = input.seed;
  return out;
}

/* ----------------------- Plain function endpoints ------------------------ */

export async function createExperiment(body: CreateExperimentBody): Promise<Experiment> {
  // body.gridSpec should already be clean (constructed by our UI), but keep it safe.
  const payload: CreateExperimentBody = { ...body, gridSpec: sanitizeGrid(body.gridSpec) };
  return postJSON<Experiment, CreateExperimentBody>("/experiments", payload);
}

/** Accepts either the experimentId string OR { id, gridOverride } */
export async function runExperiment(
  input: string | { id: string; gridOverride?: Record<string, unknown> }
): Promise<{ ok: boolean; runId: string }> {
  const id = typeof input === "string" ? input : input.id;
  const rawOverride = typeof input === "string" ? undefined : input.gridOverride;
  const body = rawOverride ? { gridOverride: sanitizeGrid(rawOverride) } : undefined;
  return postJSON<{ ok: boolean; runId: string }, any>(`/experiments/${id}/run`, body);
}

/* -------------------------------- Queries -------------------------------- */

type Page<T> = { data: T[]; nextCursor?: string };

const keepPrev = <T,>(prev: T | undefined) => prev;

export function useExperiments(opts: any = {}) {
  return useQuery<Experiment[]>({
    queryKey: ["experiments"],
    queryFn: () => getJSON<Experiment[]>("/experiments"),
    enabled: opts.enabled ?? true,
    placeholderData: keepPrev,
    ...opts,
  });
}

export function useExperiment(id: string, opts: any = {}) {
  return useQuery<Experiment>({
    queryKey: ["experiment", id],
    queryFn: () => getJSON<Experiment>(`/experiments/${id}`),
    enabled: !!id && (opts.enabled ?? true),
    placeholderData: keepPrev,
    ...opts,
  });
}

export function useResponses(
  id: string,
  opts: { cursor?: string; limit?: number; enabled?: boolean } = {}
) {
  return useQuery<ResponseRow[]>({
    queryKey: ["responses", id, opts.cursor ?? null, opts.limit ?? 50],
    queryFn: async () => {
      const page = await getJSON<Page<ResponseRow>>(
        `/experiments/${id}/responses${buildCursor(opts.cursor, opts.limit)}`
      );
      return page?.data ?? [];
    },
    enabled: !!id && (opts.enabled ?? true),
    placeholderData: keepPrev,
    ...opts,
  });
}

export function useMetrics(
  id: string,
  opts: { cursor?: string; limit?: number; enabled?: boolean } = {}
) {
  return useQuery<MetricRow[]>({
    queryKey: ["metrics", id, opts.cursor ?? null, opts.limit ?? 50],
    queryFn: async () => {
      const page = await getJSON<Page<MetricRow>>(
        `/experiments/${id}/metrics${buildCursor(opts.cursor, opts.limit)}`
      );
      return page?.data ?? [];
    },
    enabled: !!id && (opts.enabled ?? true),
    placeholderData: keepPrev,
    ...opts,
  });
}

function buildCursor(cursor?: string, limit?: number) {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  if (limit) qs.set("limit", String(limit));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/* -------------------------------- Mutations ------------------------------- */

export function useCreateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExperimentBody) => createExperiment(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments"] });
    },
  });
}

export function useRunExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: string | { id: string; gridOverride?: Record<string, unknown> }) =>
      runExperiment(input),
    onSuccess: (_res, input) => {
      const id = typeof input === "string" ? input : input.id;
      qc.invalidateQueries({ queryKey: ["experiment", id] });
      qc.invalidateQueries({ queryKey: ["responses", id] });
      qc.invalidateQueries({ queryKey: ["metrics", id] });
    },
  });
}

export function useCreateAndRun() {
  const create = useCreateExperiment();
  const runMut = useRunExperiment();
  return {
    isPending: create.isPending || runMut.isPending,
    async run(input: CreateExperimentBody) {
      const exp = await create.mutateAsync(input);
      await runMut.mutateAsync(exp.id);
      return exp;
    },
  };
}

/* --------------------------- SSE helper (runs) --------------------------- */

export async function openRunStream(runId: string, onEvent: (evt: MessageEvent) => void) {
  const es = new EventSource(`${API_BASE}/runs/${runId}/stream`);
  es.onmessage = onEvent;
  es.addEventListener("progress", onEvent);
  es.addEventListener("completed", onEvent);
  es.addEventListener("failed", onEvent);
  return es;
}
