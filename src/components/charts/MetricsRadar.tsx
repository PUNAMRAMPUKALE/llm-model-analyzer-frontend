'use client';

import { useMemo } from 'react';
import * as R from 'recharts';
import type { MetricRow } from '@/services/api';

type Props = { metrics: MetricRow[] };

export default function MetricsRadar({ metrics = [] }: Props) {
  // Build the union of score keys across all metrics
  const keys = useMemo(
    () => Array.from(new Set(metrics.flatMap((m) => Object.keys(m.scores ?? {})))),
    [metrics]
  );

  if (!metrics.length || !keys.length) {
    return (
      <div className="card p-4">
        <h2 className="font-medium mb-2">Metrics Overview</h2>
        <div className="text-sm text-muted-foreground">No metrics yet.</div>
      </div>
    );
  }

  // Transform per metric into radar series-friendly data
  const radarData = keys.map((k) => {
    const row: any = { metric: k };
    metrics.forEach((m, i) => {
      row[`resp${i + 1}`] = Number(m.scores?.[k] ?? 0);
    });
    return row;
  });

  return (
    <div className="card p-4">
      <h2 className="font-medium mb-2">Metrics Overview</h2>
      <div className="h-80 min-w-0">
        <R.ResponsiveContainer width="100%" height="100%">
          <R.RadarChart data={radarData}>
            <R.PolarGrid />
            <R.PolarAngleAxis dataKey="metric" />
            <R.PolarRadiusAxis angle={30} domain={[0, 1]} />
            {metrics.map((_, i) => (
              <R.Radar
                key={i}
                name={`Resp ${i + 1}`}
                dataKey={`resp${i + 1}`}
                dot={false}
                strokeOpacity={0.9}
                fillOpacity={0.25}
              />
            ))}
            <R.Legend />
          </R.RadarChart>
        </R.ResponsiveContainer>
      </div>
    </div>
  );
}
