import Link from "next/link";

export function SiteHeader(){
  return (
    <header className="sticky top-0 z-40 border-b border-stroke/60 bg-bg/70 backdrop-blur">
      <div className="container-page py-3 flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold hover:opacity-90">LLM Lab</Link>
        <nav className="text-sm flex gap-4">
          <Link className="hover:text-accent" href="/experiments">Experiments</Link>
          <Link className="hover:text-accent" href="/exports">Export</Link>
          <Link className="hover:text-accent" href="/docs">Docs</Link>
        </nav>
      </div>
    </header>
  );
}
