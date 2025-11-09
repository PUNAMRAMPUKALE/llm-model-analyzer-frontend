// frontend/src/types/domain.ts

export type GridSpec = {
  temperature?: number[];
  top_p?: number[];
  top_k?: number[];
  max_tokens?: number[];
  samples?: number;
  seed?: number | null;
};

export type Experiment = {
  id: string;
  title: string;
  prompt: string;
  model: string;
  gridSpec: Record<string, unknown>;
  createdAt: string;
  runs: Array<{
    id: string;
    status: 'PENDING' | 'RUNNING' | 'PARTIAL' | 'COMPLETED' | 'FAILED';
    startedAt?: string | null;
    completedAt?: string | null;
  }>;
};

export type ResponseRow = {
  id: string;
  createdAt: string;
  text: string;
  latencyMs: number | null;   // may be null for mock
  tokensIn: number | null;
  tokensOut: number | null;
  params: Record<string, unknown>;
};

export type MetricRow = {
  id: string;
  responseId: string;
  overallQuality: number;
  scores: Record<string, number>;
  details: Record<string, unknown>;
  versions: Record<string, string>;
};

export type Page<T> = { data: T[]; nextCursor?: string };
