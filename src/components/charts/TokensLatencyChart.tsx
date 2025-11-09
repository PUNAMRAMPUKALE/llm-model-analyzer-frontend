"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { ResponseRow } from "@/types/domain";

type Props = { rows?: ResponseRow[] };

export default function TokensLatencyChart({ rows = [] }: Props) {
  const data = useMemo(
    () =>
      (Array.isArray(rows) ? rows : []).map((r, i) => ({
        i,
        latency: r.latencyMs ?? 0,
        inTok: r.tokensIn ?? 0,
        outTok: r.tokensOut ?? 0,
      })),
    [rows]
  );

  if (!data.length) {
    return (
      <div className="text-sm text-zinc-400">
        No responses yet to chart.
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-zinc-200">Tokens &amp; Latency</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="i" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="latency" name="latency (ms)" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="inTok" name="tokens in" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="outTok" name="tokens out" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
