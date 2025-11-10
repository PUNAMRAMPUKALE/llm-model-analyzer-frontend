// frontend/src/components/analysis/QualityCharts.tsx
"use client";

import React, { useMemo } from "react";
import type { MetricRow, ResponseRow } from "@/types/domain";

import {
  ResponsiveContainer,
  PolarGrid as R_PolarGrid,
  PolarAngleAxis as R_PolarAngleAxis,
  PolarRadiusAxis as R_PolarRadiusAxis,
  Radar as R_Radar,
  RadarChart as R_RadarChart,
  Tooltip as R_Tooltip,
  Legend as R_Legend,
  CartesianGrid as R_CartesianGrid,
  ScatterChart as R_ScatterChart,
  XAxis as R_XAxis,
  YAxis as R_YAxis,
  Scatter as R_Scatter,
  BarChart as R_BarChart,
  Bar as R_Bar,
} from "recharts";

/* ---------- Cast to any to avoid strict JSX 'props' signature issues ---------- */
const PolarGrid = R_PolarGrid as any;
const PolarAngleAxis = R_PolarAngleAxis as any;
const PolarRadiusAxis = R_PolarRadiusAxis as any;

const RadarChart = R_RadarChart as any;
const Radar = R_Radar as any;

const Tooltip = R_Tooltip as any;
const Legend = R_Legend as any;

const CartesianGrid = R_CartesianGrid as any;
const ScatterChart = R_ScatterChart as any;
const XAxis = R_XAxis as any;
const YAxis = R_YAxis as any;
const Scatter = R_Scatter as any;

const BarChart = R_BarChart as any;
const Bar = R_Bar as any;

/* -------------------------------- helpers -------------------------------- */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const pct = (x: number | undefined | null) =>
  Math.round(clamp01(Number.isFinite(Number(x)) ? Number(x) : 0) * 100);

// Recharts tooltip formatter must return [value, name]
const fmtVal = (value: any): [number, string] => {
  const v = typeof value === "number" ? value : Number(value) || 0;
  return [v, ""];
};

const ORDER: Array<keyof Required<MetricRow>["scores"]> = [
  "coherence",
  "redundancy",
  "completeness",
  "lexical_diversity",
  "structure",
  "readability",
  "length_adequacy",
];

const LABEL: Record<string, string> = {
  coherence: "coherence",
  redundancy: "redundancy",
  completeness: "completeness",
  lexical_diversity: "lexical diversity",
  structure: "structure",
  readability: "readability",
  length_adequacy: "length adequacy",
};

/* ------------------------------- component ------------------------------- */
export default function QualityCharts({
  responses = [],
  metrics = [],
}: {
  responses?: ResponseRow[];
  metrics?: MetricRow[];
}) {
  const byId = useMemo(() => {
    const m = new Map<string, MetricRow>();
    (metrics ?? []).forEach((mr) => m.set(mr.responseId, mr));
    return m;
  }, [metrics]);

  const metricKeys = useMemo(() => {
    const first = metrics?.find((m) => m?.scores && Object.keys(m.scores).length);
    const keys = first ? Object.keys(first.scores!) : [];
    return ORDER.filter((k) => keys.includes(k));
  }, [metrics]);

  const radarData = useMemo(() => {
    if (!metricKeys.length) return [];
    const acc: Record<string, { sum: number; n: number }> = {};
    metricKeys.forEach((k) => (acc[k] = { sum: 0, n: 0 }));
    metrics.forEach((m) => {
      metricKeys.forEach((k) => {
        const v = Number((m.scores ?? ({} as any))[k] ?? 0);
        if (!Number.isNaN(v)) {
          acc[k].sum += clamp01(v);
          acc[k].n += 1;
        }
      });
    });
    return metricKeys.map((k) => ({
      metricLabel: LABEL[k] ?? k,
      percent: pct(acc[k].n ? acc[k].sum / acc[k].n : 0),
      score: acc[k].n ? acc[k].sum / acc[k].n : 0,
    }));
  }, [metrics, metricKeys]);

  const scatterData = useMemo(() => {
    const rows: Array<{ coherence: number; overall: number; id: string }> = [];
    metrics.forEach((m) => {
      const coh = pct((m.scores ?? ({} as any)).coherence ?? 0);
      const overall = pct(m.overallQuality ?? 0);
      rows.push({ id: m.responseId, coherence: coh, overall });
    });
    return rows;
  }, [metrics]);

  const barsData = useMemo(() => {
    const rows: Array<{ name: string; overall: number }> = [];
    metrics.forEach((m, i) =>
      rows.push({ name: `#${i + 1}`, overall: pct(m.overallQuality ?? 0) })
    );
    rows.sort((a, b) => b.overall - a.overall);
    return rows;
  }, [metrics]);

  const hasMetrics = metrics.length > 0 && metricKeys.length > 0;

  return (
    <div className="grid gap-6">
      {/* Radar: batch profile */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="text-sm font-medium mb-2">Batch profile (mean scores)</div>
        {hasMetrics ? (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metricLabel" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="mean" dataKey="percent" fillOpacity={0.45} />
                <Tooltip formatter={(v: any) => fmtVal(v)} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">No metric keys found to plot.</div>
        )}
      </div>

      {/* Scatter: coherence vs overall */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="text-sm font-medium mb-2">
          Coherence % vs Overall quality % (per response)
        </div>
        {scatterData.length ? (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="coherence" name="coherence %" domain={[0, 100]} />
                <YAxis type="number" dataKey="overall" name="overall %" domain={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: any) => fmtVal(v)} />
                <Legend />
                <Scatter name="responses" data={scatterData} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">No points to plot yet.</div>
        )}
      </div>

      {/* Bars: overall quality per response */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="text-sm font-medium mb-2">Overall quality % (per response)</div>
        {barsData.length ? (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={barsData}>
                <CartesianGrid />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v: any) => fmtVal(v)} />
                <Legend />
                <Bar dataKey="overall" name="overall %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">No responses yet.</div>
        )}
      </div>
    </div>
  );
}
