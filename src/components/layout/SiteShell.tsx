"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import RunBanner from "./RunBanner";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <RunBanner />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-stroke/60 text-xs p-6 text-center">
        <div className="container-page">
          <div className="mb-2 text-mute">© {new Date().getFullYear()} LLM Model Analyzer</div>
          <div className="text-zinc-300">
            Built with Next.js, TanStack Query, Tailwind, and Recharts. Theme accents:
            <span className="ml-1 inline-flex items-center gap-2">
              <i className="inline-block h-2 w-2 rounded-full bg-accent" /> blue
              <i className="inline-block h-2 w-2 rounded-full bg-[--accent-2] bg-[color:var(--tw-prose-body,#a06bff)]" />
              <i className="inline-block h-2 w-2 rounded-full bg-[--accent-3]" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
