"use client";

export default function Docs() {
  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold">How this works</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h3 className="font-medium mb-1">1. Set Prompt</h3>
          <p className="text-sm text-mute">Describe what you want the model to do.</p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-1">2. Choose Parameters</h3>
          <p className="text-sm text-mute">
            Use buttons to pick <code>temperature</code>, <code>top_p</code>, and <code>max_tokens</code>.
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-1">3. Run & Compare</h3>
          <p className="text-sm text-mute">See responses with metrics and export the best.</p>
        </div>
      </div>

      <div className="card p-4 text-sm">
        API: set <code>NEXT_PUBLIC_API_BASE</code> in <code>.env.local</code> (default <code>http://localhost:4000</code>).
      </div>
    </main>
  );
}
