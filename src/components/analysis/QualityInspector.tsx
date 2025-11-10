"use client";

import React, { useMemo } from "react";
import type { MetricRow, ResponseRow } from "@/types/domain";

/* ------------------------ small numeric utilities ------------------------ */
function clamp01(x:number){ return Math.max(0, Math.min(1, x)); }
function mean(xs:number[]){ return xs.length? xs.reduce((a,b)=>a+b,0)/xs.length : 0; }
function stdev(xs:number[]){
  if (xs.length < 2) return 0;
  const m = mean(xs); const v = mean(xs.map(x => (x-m)*(x-m)));
  return Math.sqrt(v);
}
function corr(x:number[], y:number[]){
  if (!x.length || x.length !== y.length) return 0;
  const mx = mean(x), my = mean(y);
  let num=0, dx=0, dy=0;
  for (let i=0;i<x.length;i++){ const a=x[i]-mx; const b=y[i]-my; num+=a*b; dx+=a*a; dy+=b*b; }
  return dx && dy ? num / Math.sqrt(dx*dy) : 0;
}
function tokens(t:string){ return (t.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(w => w.length>2); }
function jaccard(a:Set<string>, b:Set<string>){ const i=new Set([...a].filter(x=>b.has(x))); const u=new Set([...a,...b]); return u.size? i.size/u.size : 0; }
function formatPct(x:number){ return `${Math.round(clamp01(x)*100)}%`; }

/* ----------------------------- param helpers ----------------------------- */
function paramsOf(r: ResponseRow){
  const p = (r.params ?? {}) as any;
  return {
    temperature: typeof p.temperature === "number" ? p.temperature : undefined,
    top_p: typeof p.top_p === "number" ? p.top_p : undefined,
    max_tokens: typeof p.max_tokens === "number" ? p.max_tokens : undefined,
    seed: typeof p.seed === "number" ? p.seed : undefined,
  };
}

/* ------------------------------- batch stats ----------------------------- */
function buildBatchStats(responses: ResponseRow[], metrics: MetricRow[]){
  const qById = new Map<string, number>();
  const mById = new Map<string, MetricRow>();
  metrics.forEach(m => { qById.set(m.responseId, m.overallQuality ?? 0); mById.set(m.responseId, m); });

  const rows = responses.filter(r => qById.has(r.id));
  const qVals = rows.map(r => qById.get(r.id)!);
  const qMean = mean(qVals);
  const qStd  = stdev(qVals);

  // parameter vectors
  const pKeys = ["temperature","top_p","max_tokens","seed"] as const;
  const paramCorrelations: Record<string, number> = {};
  for (const k of pKeys) {
    const xs:number[] = [];
    const ys:number[] = [];
    rows.forEach(r => {
      const v = (paramsOf(r) as any)[k];
      if (typeof v === "number") { xs.push(v); ys.push(qById.get(r.id)!); }
    });
    if (xs.length >= 3) paramCorrelations[k] = corr(xs, ys);
  }

  // per-metric batch distribution
  const sampleMetric = mById.values().next().value as MetricRow | undefined;
  const metricKeys = Object.keys(sampleMetric?.scores ?? {});
  const perMetric: Record<string, { mean: number; std: number }> = {};
  metricKeys.forEach(k => {
    const vals = rows.map(r => Number(mById.get(r.id)?.scores?.[k] ?? 0));
    perMetric[k] = { mean: mean(vals), std: stdev(vals) };
  });

  // precompute token sets for variety
  const tokById = new Map<string, Set<string>>();
  responses.forEach(r => tokById.set(r.id, new Set(tokens(r.text ?? ""))));

  return { qById, qMean, qStd, mById, perMetric, paramCorrelations, tokById };
}

/* ----------------------- strengths / weaknesses rank --------------------- */
function rankStrengthsWeaknesses(
  m: MetricRow,
  perMetric: Record<string, { mean:number; std:number }>
) {
  const items = Object.entries(m.scores ?? {}).map(([k, v]) => {
    const { mean, std } = perMetric[k] ?? { mean: 0, std: 0 };
    const hasStd = !!std;
    const z = hasStd ? (Number(v) - mean) / std : NaN; // NaN => n/a
    return { key: k, value: Number(v), z, hasStd };
  });

  // primary (relative-to-batch) selection
  const MIN_Z = 0.5;
  let strengths = items.filter(x => x.hasStd && x.z >= MIN_Z).sort((a,b)=> (b.z - a.z)).slice(0,3);
  let weaknesses = items.filter(x => x.hasStd && x.z <= -MIN_Z).sort((a,b)=> (a.z - b.z)).slice(0,3);

  // fallback: always show at least one top and one bottom by absolute score
  if (!strengths.length && items.length) strengths = [[...items].sort((a,b)=>b.value-a.value)[0]];
  if (!weaknesses.length && items.length) weaknesses = [[...items].sort((a,b)=>a.value-b.value)[0]];
  return { strengths, weaknesses, items };
}

/* ----------------------- friendly metric explanations -------------------- */
const ORDER: Array<keyof Required<MetricRow>["scores"]> = [
  "coherence",
  "redundancy",
  "completeness",
  "lexical_diversity",
  "structure",
  "readability",
  "length_adequacy",
];

const EXPLAIN: Record<string, string> = {
  coherence: "How smoothly sentences connect.",
  redundancy: "How much repetition exists.",
  completeness: "How much of your prompt the response covered.",
  lexical_diversity: "Variety of vocabulary used.",
  structure: "Presence of headings, lists, bullet points, etc.",
  readability: "How easy it is to read (sentence length, syllables).",
  length_adequacy: "How close the response is to the target length.",
};

function valueSummary(name: string, percent: number) {
  if (name === "coherence") return percent < 40 ? "Very poor flow → sentences feel disconnected." : "Good flow.";
  if (name === "redundancy") return percent === 100 ? "No repetition at all → very good." : "Some repetition present.";
  if (name === "completeness") return percent >= 70 ? "Good keyword coverage, but not perfect." : "Missing many prompt keywords.";
  if (name === "lexical_diversity") return percent >= 60 ? "Good variety, not repetitive." : "Low vocabulary variety.";
  if (name === "structure") return percent === 100 ? "Excellent structure → formatting is strong." : "Weak structure; add headings/lists.";
  if (name === "readability") return percent >= 70 ? "Very readable, flows well." : "Hard to read; simplify sentences.";
  if (name === "length_adequacy") return percent < 50 ? "Too short or too long compared to ideal length." : "Close to ideal length.";
  return "";
}

function humanSummary(scores: Record<string, number> = {}) {
  const parts: string[] = [];
  if ((scores.structure ?? 0) > 0.8) parts.push("well-structured");
  if ((scores.readability ?? 0) > 0.7) parts.push("readable");
  if ((scores.lexical_diversity ?? 0) > 0.6) parts.push("uses diverse wording");
  if ((scores.redundancy ?? 0) === 1) parts.push("avoids repetition");

  const issues: string[] = [];
  if ((scores.coherence ?? 1) < 0.4) issues.push("coherence is weak");
  if ((scores.length_adequacy ?? 1) < 0.5) issues.push("length is far from the expected target");
  if ((scores.completeness ?? 1) < 0.6) issues.push("coverage of the prompt is incomplete");

  const good = parts.length ? `This response is ${parts.join(", ")}.` : "";
  const bad = issues.length ? ` However, ${issues.join("; ")}.` : "";
  return (good + bad) || "No decisive pattern detected.";
}

/* -------------------------------- component ------------------------------ */
export default function QualityInspector({
  responses = [],
  metrics = [],
  focusId,
}: {
  responses?: ResponseRow[];
  metrics?: MetricRow[];
  focusId: string;
}) {
  const batch = useMemo(() => buildBatchStats(responses, metrics), [responses, metrics]);
  const m = useMemo(() => metrics.find(x => x.responseId === focusId), [metrics, focusId]);
  const r = useMemo(() => responses.find(x => x.id === focusId), [responses, focusId]);

  if (!r || !m) return <div className="p-4 text-sm text-zinc-400">No metrics recorded for this response.</div>;

  const { strengths, weaknesses } = rankStrengthsWeaknesses(m, batch.perMetric);

  // Variety vs other responses
  const thisSet = batch.tokById.get(r.id) ?? new Set<string>();
  let avgJac = 0, n=0;
  responses.forEach(other => {
    if (other.id === r.id) return;
    const o = batch.tokById.get(other.id); if (!o) return;
    avgJac += jaccard(thisSet, o); n++;
  });
  const variety = n ? 1 - avgJac/n : 0.0;

  // Parameter tendencies (correlations) + this response params
  const params = paramsOf(r);
  const paramNotes: string[] = [];
  Object.entries(batch.paramCorrelations).forEach(([k, rho]) => {
    if (Math.abs(rho) < 0.2) return;
    paramNotes.push(`${k}: ${rho > 0 ? "higher" : "lower"} values correlate with higher overall quality (r≈${rho.toFixed(2)}).`);
  });

  /* ------------------------ RENDER: friendly metrics ------------------------ */
  const scores = (m.scores ?? {}) as Record<string, number>;

  return (
    <div className="space-y-4">
      {/* 1) Quality Metrics (programmatic) — friendly bullet format */}
      <div>
        <div className="text-sm font-medium mb-1">Quality Metrics (programmatic)</div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 text-sm">
          {ORDER.filter(k => typeof scores[k] === "number").map((k) => {
            const pct = Math.round(clamp01(scores[k]) * 100);
            const name = k.replaceAll("_"," ");
            return (
              <div key={k} className="mb-4">
                <p className="font-medium">• {name} ({pct}%)</p>
                <p className="text-sm text-zinc-300">{EXPLAIN[k]}</p>
                <p className="text-sm text-zinc-400">
                  {pct}% = {valueSummary(k, pct)}
                </p>
              </div>
            );
          })}

          {/* Missing keywords hint when completeness is low */}
          {Array.isArray((m as any).details?.keywordsMissed) &&
           (scores.completeness ?? 0) < 0.4 &&
           (m as any).details.keywordsMissed.length > 0 && (
            <div className="mt-1 text-xs text-amber-300/90">
              Missing prompt ideas: <b>{(m as any).details.keywordsMissed.slice(0,3).join(", ")}</b>
            </div>
          )}

          {/* Summary */}
          <div className="mt-2 p-3 rounded-md bg-zinc-800 text-sm">
            <h3 className="font-semibold mb-1">Summary</h3>
            <p className="text-zinc-300">
              {(m as any).details?.summary ? (m as any).details.summary : humanSummary(scores)}
            </p>
          </div>
        </div>
      </div>

      {/* 2) Parameter → Response Analysis */}
      <div>
        <div className="text-sm font-medium mb-1">Parameter → Response Analysis</div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 text-sm space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(params).map(([k,v]) => (
              <span
                key={k}
                className="inline-flex items-center rounded border border-zinc-700/60 bg-zinc-950/40 px-2 py-0.5"
              >
                <span>{k}=</span>
                <b className="ml-1">{v ?? "—"}</b>
              </span>
            ))}
          </div>
          {paramNotes.length ? (
            <ul className="list-disc pl-5">
              {paramNotes.map((ln,i)=><li key={i}>{ln}</li>)}
            </ul>
          ) : (
            <div className="text-xs text-zinc-400">Insufficient parameter spread to learn tendencies this batch.</div>
          )}
        </div>
      </div>

      {/* 3) Derived Insights (from metrics vs batch) */}
      <div>
        <div className="text-sm font-medium mb-1">Derived Insights</div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 text-sm space-y-2">
          <div className="text-xs text-emerald-300/90 font-medium">Strengths</div>
          {strengths.length ? (
            <ul className="list-disc pl-5">
              {strengths.map(s => (
                <li key={s.key}>
                  {s.key.replaceAll("_"," ")} is strong ({formatPct(s.value)}; z≈{Number.isFinite(s.z) ? s.z.toFixed(2) : "n/a"}) relative to this batch.
                </li>
              ))}
            </ul>
          ) : <div className="text-xs text-zinc-400">No stand-out strengths vs batch.</div>}

          <div className="text-xs text-rose-300/90 font-medium mt-2">Weaknesses</div>
          {weaknesses.length ? (
            <ul className="list-disc pl-5">
              {weaknesses.map(s => (
                <li key={s.key}>
                  {s.key.replaceAll("_"," ")} underperforms ({formatPct(s.value)}; z≈{Number.isFinite(s.z) ? s.z.toFixed(2) : "n/a"}). Consider changing parameters accordingly.
                </li>
              ))}
            </ul>
          ) : <div className="text-xs text-zinc-400">No clear weaknesses vs batch.</div>}

          <div className="text-xs text-zinc-300 mt-2">
            Variety vs others in this run: <b>{formatPct(variety)}</b> (1 = very different).
          </div>
        </div>
      </div>
    </div>
  );
}
