'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Render = (w: number, h: number) => React.ReactNode;

export default function Measure({
  height = 320,
  minWidth = 120,
  children,
}: { height?: number; minWidth?: number; children: Render }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState<number>(0);

  const read = () => {
    const el = ref.current;
    if (!el) return;
    const rectW = el.getBoundingClientRect?.().width ?? el.offsetWidth ?? el.clientWidth ?? 0;
    const next = Math.max(1, Math.floor(Number(rectW)));
    if (Number.isFinite(next)) setW(next);
  };

  useLayoutEffect(() => { read(); }, []);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(read);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const ready = Number.isFinite(w) && w >= minWidth;

  return (
    <div ref={ref} style={{ width: '100%', height }}>
      {ready ? children(w, height) : null}
    </div>
  );
}
