"use client";

export default function Docs() {
  return (
    <main className="container-page space-y-6">
      <h1 className="text-2xl font-semibold flex items-center justify-between">
  <span>Documentation</span>
 <a
    href="/"
    className="btn btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
  >
    Back to Home
  </a>
  </h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h3 className="font-medium mb-1">1. Set Prompt</h3>
          <p className="text-sm text-mute">Describe what you want the model to do. Keep it specific and testable.</p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-1">2. Choose Parameters</h3>
          <p className="text-sm text-mute">
            Use presets or customize <code>temperature</code>, <code>top_p</code>, <code>max_tokens</code>, <code>seed</code>.
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-1">3. Run & Compare</h3>
          <p className="text-sm text-mute">Review responses, metrics, and the Strong Pick. Export JSON/CSV.</p>
        </div>
      </div>

      <div className="card p-4 space-y-3 text-sm">
        <div className="font-medium">Quick start</div>
        <ol className="list-decimal pl-5 space-y-1 text-zinc-300">
          <li>Set <code>NEXT_PUBLIC_API_BASE</code> in <code>.env.local</code> (default <code>http://localhost:4000</code>).</li>
          <li>Open <b>Experiments</b>, create a new experiment (prompt + grid spec).</li>
          <li>Click <b>Run</b>. Watch live progress. Results appear under <b>Responses</b>.</li>
          <li>Click a response to see full text and <b>Quality Inspector</b> metrics.</li>
          <li>Use <b>Open Best Fit</b> to jump to the highest overall quality response.</li>
          <li>Export from the experiment page or the Exports center.</li>
        </ol>

        <div className="font-medium pt-2">Metrics explained</div>
        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
          <li><b>Coherence</b>: sentence flow and connective quality.</li>
          <li><b>Redundancy</b>: repetition penalty (higher is better = less repetition).</li>
          <li><b>Completeness</b>: prompt keyword/topic coverage.</li>
          <li><b>Lexical diversity</b>: vocabulary variety.</li>
          <li><b>Structure</b>: headings/lists present and well-formed.</li>
          <li><b>Readability</b>: shorter sentences, fewer syllables → higher score.</li>
          <li><b>Length adequacy</b>: closeness to target length.</li>
        </ul>

        <div className="font-medium pt-2">Troubleshooting</div>
        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
          <li>Can’t connect? Verify <code>NEXT_PUBLIC_API_BASE</code> and CORS on the server.</li>
          <li>No metrics? Ensure your backend returns metric rows at <code>/experiments/:id/metrics</code>.</li>
          <li>Streaming stalls? Check SSE endpoint <code>/runs/:runId/stream</code> and proxies.</li>
        </ul>
      </div>
    </main>
  );
}
