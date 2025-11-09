// src/components/console/LiveLLMStream.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** A short title/label for the preview (optional). */
  prompt?: string;
  /** Lines to “type out” live under the prompt. */
  previewBlocks?: string[];
  /** Typing speed in ms per character (optional). */
  speedMsPerChar?: number;
};

export default function LiveLLMStream({
  prompt = "Preview",
  previewBlocks = [],
  speedMsPerChar = 8,
}: Props) {
  const text = useMemo(() => previewBlocks.join("\n"), [previewBlocks]);
  const [typed, setTyped] = useState("");
  const idxRef = useRef(0);

  useEffect(() => {
    setTyped("");
    idxRef.current = 0;
    if (!text) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const i = idxRef.current;
      if (i >= text.length) return;
      setTyped((s) => s + text[i]);
      idxRef.current = i + 1;
      setTimeout(tick, speedMsPerChar);
    };
    tick();

    return () => {
      cancelled = true;
    };
  }, [text, speedMsPerChar]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-zinc-300">{prompt}</div>
      <pre className="min-h-[140px] rounded-lg bg-zinc-950/60 p-3 text-sm leading-6 ring-1 ring-zinc-800 whitespace-pre-wrap">
        {typed}
        <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-zinc-400/60 align-middle" />
      </pre>
    </div>
  );
}
