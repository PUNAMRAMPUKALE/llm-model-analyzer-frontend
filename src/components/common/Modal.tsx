"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onDownload?: (contentEl: HTMLElement | null) => void;
  children: React.ReactNode;
};

export default function Modal({ open, title = "Details", onClose, onDownload, children }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const portalRef = useRef<HTMLElement | null>(null);
  const printableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const host = document.getElementById("__modal_root__") || (() => {
      const d = document.createElement("div");
      d.id = "__modal_root__";
      document.body.appendChild(d);
      return d;
    })();
    portalRef.current = host;
    return () => setMounted(false);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !portalRef.current || !open) return null;

  const content = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* dialog */}
      <div className="relative z-[1001] w-full max-w-5xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="text-sm font-medium text-zinc-200">{title}</div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                className="text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-white"
                onClick={() => onDownload(printableRef.current)}
              >
                Download PDF
              </button>
            )}
            <button
              className="text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 px-3 py-1 text-white"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div
          ref={printableRef}
          className="p-4 max-h-[75vh] overflow-auto"
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, portalRef.current);
}
