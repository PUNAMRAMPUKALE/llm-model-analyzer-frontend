export function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  const cols = Array.from(
    rows.reduce<Set<string>>((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set())
  );

  const header = cols.join(',');
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r[c];
          const str =
            v == null
              ? ''
              : typeof v === 'object'
              ? JSON.stringify(v)
              : String(v);
          // naive CSV escaping
          return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    )
    .join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
