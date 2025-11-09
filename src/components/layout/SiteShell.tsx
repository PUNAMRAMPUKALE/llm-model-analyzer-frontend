import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import RunBanner from "./RunBanner";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <RunBanner />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-stroke/60 text-xs p-3 text-center text-mute">© LLM Lab</footer>
    </div>
  );
}
