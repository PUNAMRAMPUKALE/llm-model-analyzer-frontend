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

      {/* --- High-level Overview Cards --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h3 className="font-medium mb-1">1. Set Prompt</h3>
          <p className="text-sm text-mute">
            Write a clear instruction for the model. The system uses this as the
            base for all parameter combinations you test.
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-1">2. Configure Parameters</h3>
          <p className="text-sm text-mute">
            Choose your values for <code>temperature</code>,{" "}
            <code>top_p</code>, <code>max_tokens</code>, or <code>seed</code>.
            These settings shape how the model generates each response.
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-1">3. Run &amp; Evaluate</h3>
          <p className="text-sm text-mute">
            Execute the experiment, view responses in real time, compare
            metrics, and export the results in multiple formats.
          </p>
        </div>
      </div>

      {/* --- Project Explanation --- */}
      <div className="card p-4 space-y-3 text-sm">
        <div className="font-medium">What this project does</div>
        <p className="text-zinc-300 leading-relaxed">
          This tool helps you study how different LLM parameters affect the
          quality of generated responses. Each time you run an experiment, the
          backend expands your parameter grid, sends each combination to the
          model, computes quality metrics, and streams updates back to the UI.
          You can watch responses appear as they are produced, compare them
          using a consistent scoring system, and export everything for analysis
          or reporting.
        </p>

        {/* --- Basic How-To --- */}
        <div className="font-medium pt-2">Quick start</div>
        <ol className="list-decimal pl-5 space-y-1 text-zinc-300">
          <li>
            Set <code>NEXT_PUBLIC_API_BASE</code> in <code>.env.local</code>{" "}
            (default: <code>http://localhost:4000</code>).
          </li>
          <li>Create a new experiment from the Home page.</li>
          <li>Enter your prompt and define a parameter grid.</li>
          <li>
            Click <b>Run</b>. The page connects to the backend using Server-Sent
            Events (SSE) and shows responses as they are generated.
          </li>
          <li>
            Inspect any response to see the computed metrics and reasoning
            behind the score.
          </li>
          <li>
            Export the data as CSV or JSON, or download all experiments from the
            Export Center.
          </li>
        </ol>

        {/* --- Metrics Explanation --- */}
        <div className="font-medium pt-2">How the scoring works</div>
        <p className="text-zinc-300 leading-relaxed">
          Every response is evaluated using a set of metrics designed to capture
          different aspects of quality. These metrics are computed directly in
          the backend for consistency and transparency.
        </p>

        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
          <li>
            <b>Completeness</b>: checks whether the response covers the main
            ideas in your prompt.
          </li>
          <li>
            <b>Coherence</b>: measures whether sentences connect logically and
            flow well.
          </li>
          <li>
            <b>Structure</b>: looks for headings, lists, and section
            organization.
          </li>
          <li>
            <b>Redundancy</b>: penalizes repeated phrases or filler content.
          </li>
          <li>
            <b>Lexical diversity</b>: evaluates vocabulary variety.
          </li>
          <li>
            <b>Readability</b>: estimates how easy the text is to follow.
          </li>
          <li>
            <b>Length adequacy</b>: compares the output length to the target for
            the prompt.
          </li>
        </ul>

        {/* --- SSE + Data Flow --- */}
        <div className="font-medium pt-2">How real-time updates work</div>
        <p className="text-zinc-300 leading-relaxed">
          When you run an experiment, the frontend opens a persistent connection
          to the backend using Server-Sent Events (SSE). Each time a response is
          generated or its metrics are computed, the backend sends a small event
          update. The UI uses those events to refresh the experiment view
          without polling or reloading, and the stream stays open until the run
          is finished.
        </p>

        {/* --- Troubleshooting --- */}
        <div className="font-medium pt-2">Troubleshooting</div>
        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
          <li>
            Connection issues? Confirm <code>NEXT_PUBLIC_API_BASE</code> and
            CORS settings on the backend.
          </li>
          <li>
            Missing metrics? Check{" "}
            <code>/experiments/:id/metrics</code> on the backend.
          </li>
          <li>
            No live updates? Verify that{" "}
            <code>/runs/:runId/stream</code> is reachable and not blocked by a
            proxy.
          </li>
        </ul>
      </div>
    </main>
  );
}
