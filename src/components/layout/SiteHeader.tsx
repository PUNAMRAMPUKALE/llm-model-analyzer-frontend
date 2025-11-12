"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHasExperiments } from "@/hooks/useHasExperiments";

function NavItem({
  href,
  label,
  disabled = false,
}: { href: string; label: string; disabled?: boolean }) {
  const path = usePathname();
  const active = path === href || (href !== "/" && path.startsWith(href));

  const base =
    "relative px-2 py-1 rounded-md transition select-none";
  const enabledCls = active
    ? "text-accent before:absolute before:inset-x-0 before:-bottom-1 before:h-[2px] before:rounded-full before:bg-accent/80"
    : "text-zinc-300 hover:text-white hover:bg-white/5";
  const disabledCls = "text-zinc-500/70 pointer-events-none cursor-not-allowed";

  return disabled ? (
    <span className={`${base} ${disabledCls}`} aria-disabled="true">{label}</span>
  ) : (
    <Link href={href} className={`${base} ${enabledCls}`}>{label}</Link>
  );
}

export function SiteHeader() {
  const { hasAny, isLoading } = useHasExperiments();
  const guard = !isLoading && !hasAny;
  return (
    <header className="sticky top-0 z-40 border-b border-stroke/60 bg-[linear-gradient(180deg,rgba(12,14,20,0.8),rgba(12,14,20,0.6))] backdrop-blur">
      <div className="container-page py-3 flex items-center justify-between gap-6">
        <Link href="/" className="text-lg font-semibold hover:opacity-90">
          LLM Lab
        </Link>
        <nav className="text-sm flex items-center gap-2">
          <NavItem href="/experiments" label="Experiments" />
          <NavItem href="/exports" label="Export" />
          <NavItem href="/docs" label="Docs" />
      </nav>
      </div>
    </header>
  );
}
