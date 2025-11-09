// src/lib/fetcher.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (r.status === 204) return undefined as unknown as T;
  if (!r.ok) throw new Error(`${init?.method ?? 'GET'} ${path} -> ${r.status}`);
  return r.json() as Promise<T>;
}

export function fetcher<T = unknown>(path: string, init?: RequestInit) {
  return fetchJSON<T>(path, init);
}

export function postJSON<T = unknown, B = unknown>(path: string, body: B) {
  return fetchJSON<T>(path, { method: 'POST', body: JSON.stringify(body) });
}
