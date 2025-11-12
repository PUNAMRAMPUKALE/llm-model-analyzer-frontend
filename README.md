✅ FINAL FRONTEND README (Next.js App)
llm-model-analyzer-frontend/README.md
### 🧪 LLM Lab – AI Response Quality Analyzer (Frontend)

This is the Next.js (React + TypeScript) frontend for LLM Lab, a full-stack application that analyzes how LLM parameter settings (temperature, top_p, etc.) influence response quality.
It offers a polished, interactive UI with experiment execution, detailed output inspection, and rich export options.

### 🌐 Overview

LLM Lab lets users:

Run experiments against an LLM provider or mock generator.
Explore how parameter sweeps impact output content.
View metrics for each response (quality, coherence, structure, etc.).
Identify the Best Fit response automatically.
Download CSV/JSON/PDF exports per experiment.
Download a global CSV of all experiments (via Export Center).
Navigate cleanly using a modern UI with hover effects and PST timestamps.

### 🧭 Features
🔹 Experiments Page

Lists all experiments fetched via GET /experiments.
Cards show:
Title
Model
Created timestamp (PST, formatted cleanly)
Responsive grid layout with consistent hover styling.

### 🔹 Experiment Detail Page

- Per-experiment view includes:
- Prompt, model, and parameter grid.
- All generated responses.
- Response metadata: tokens, latency, params.
- Metrics: scores + overallQuality.
- Automatically highlights Best Fit.
- Export options:
  1.CSV
  2.JSON
  3.PDF (browser print)

### 🔹 All Experiments Page

A dedicated page containing only cards, without running logic.
Mirrors the UI of the Home experiments section.
Useful for browsing historical experiments without clutter.

### 🔹 Export Center

A standalone interface that:
Fetches all experiments, all responses, all metrics.
Generates a unified CSV with stable ordered columns:
- experimentId
- experimentTitle
- model
- experimentCreatedAtPST
- responseId
- responseText
- tokensIn
- tokensOut
- latencyMs
- params
- scores
- details
- overallQuality
- isBestFit

CSV is UTF-8 with BOM + safe quoting.
Handles pagination automatically.

### 🔹 Docs Page

Explains:
What the system does.
How parameters influence LLM behavior.
How metrics are computed.
How exports should be interpreted.


### 🧱 Architecture
Layer	Technology
Framework	Next.js 14 (App Router)
UI	Tailwind CSS
State/Data	TanStack Query (React Query)
Exports	Client-side CSV/JSON/PDF
API Communication	REST → Backend Service
Time Formatting	PST using toLocaleString()

### 🔧 Environment Variables

Inside .env.local:

NEXT_PUBLIC_API_BASE=https://<backend-service>.onrender.com

NEXT_PUBLIC_API_BASE must point to your backend.

### ▶️ Running Locally
pnpm install
pnpm dev

### App will start on:

http://localhost:3000

### 📦 Build & Deploy
 Render

1.Build:
pnpm run build

2.Start:
pnpm start

Ensure:
SSR is enabled

NEXT_PUBLIC_API_BASE is correctly set
CORS on backend allows your frontend domain

### 📹 Demo Checklist

When demonstrating:
Load Experiments page → show cards.
Open a single experiment → show responses + metrics.
Highlight Best Fit.
Export CSV/JSON/PDF.
Open Export Center → download full dataset.
Visit Docs page to show narrative explanation.

### 🧾 License

MIT License.

### ✨ Credits

Built using Next.js, Tailwind, TanStack Query, and designed for clarity, analysis, and professional demos.