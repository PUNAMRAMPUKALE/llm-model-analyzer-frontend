# 🧪 AI Response Quality Analyzer (LLM Lab)

A full-stack web application for analyzing how **large language model (LLM)** parameters affect output quality.  
It lets users visualize, compare, and export experiments programmatically — providing a polished, demo-ready interface suitable for clients and research presentations.

---

## 🌐 Overview

**LLM Lab** enables users to:
- Enter prompts and parameter ranges (e.g., temperature, top_p).
- Generate multiple responses using LLM APIs or stored datasets.
- Automatically evaluate responses with **programmatic quality metrics** such as coherence, completeness, and structure.
- Compare and visualize the effect of parameter tuning.
- Export all experiments (input + output) as structured **CSV**, **JSON**, or **PDF** files.
- Navigate seamlessly with consistent design and “Back to Home” controls.

---

## 🧭 Core Features

### 🔹 Experiment Dashboard
- Lists all experiments with:
  - **Title**, **Model**, and **Created date/time (PST, AM/PM)**.
- Each card links to its detailed experiment view.
- All cards include smooth hover effects and timestamps formatted in PST.
- Buttons available:
  - **Export JSON / CSV / PDF** per experiment.
  - **Back to Home** for easy navigation.

---

### 🔹 Experiment Detail View
- Displays experiment configuration:
  - Full input prompt.
  - Model name and parameter combinations.
  - All generated responses.
  - Calculated metrics per response.
  - Automatically highlights **Best Fit** (highest quality).
- Exports include:
  - Input prompt + parameters.
  - Full output response text.
  - Tokens, latency, and metrics.
  - `isBestFit` flag for the top-scoring response.
- Export options:
  - **CSV** — structured table for analysis.
  - **JSON** — hierarchical data for reimport or auditing.
  - **PDF** — generated via browser print dialog.

---

### 🔹 Export Center
- Dedicated page for **global exports**.
- “Download All Results CSV”:
  - Fetches **all experiments**, **responses**, and **metrics** through backend APIs:
    - `GET /experiments`
    - `GET /experiments/:id/responses`
    - `GET /experiments/:id/metrics`
  - Aggregates every experiment’s input + output + scores into one CSV.
- CSV columns are identical to single-experiment exports.
- UTF-8 encoded with multi-line safe quoting.
- “Back to Home” button styled uniformly (indigo primary).

---

### 🔹 Documentation Page
- Explains what the app does and how to use it.
- Covers:
  - LLM parameter behavior (temperature, top_p).
  - Meaning of each metric.
  - Export structure and analysis use cases.
  - Architecture summary and data flow.

---

## 🧱 Architecture

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | **Next.js (React + TypeScript)** | Routing, UI components, and SSR |
| **State & Data** | **TanStack Query (React Query)** | API fetching and caching |
| **Styling** | **Tailwind CSS** | Responsive, accessible, modern design |
| **Backend** | **Node.js + Express (TypeScript)** | REST APIs for experiments, responses, metrics |
| **Database** | **Prisma ORM + PostgreSQL** | Persistent experiment and metrics storage |
| **Metrics Engine** | Custom logic | Computes quality scores programmatically |
| **Deployment** | **Vercel / Render / Railway** | Full-stack hosting with CI/CD |

---

## 🔍 API Endpoints

GET /experiments
GET /experiments/:id
GET /experiments/:id/responses
GET /experiments/:id/metrics
GET /exports/all → returns all experiments, responses, and metrics combined



### Experiments
Environment Variables
DATABASE_URL=
API_BASE_URL=http://localhost:3000/api

#### 🧠 Data Flow Summary

Home/Experiments page loads all experiments (/experiments) — cached via React Query.

Experiment Detail loads responses + metrics (/experiments/:id/...).

ExportButtons use the cached data — no repeated calls.

Export Center fetches all experiments, responses, and metrics dynamically for a unified CSV.

Files are generated client-side and downloaded instantly.



###### 📦 Deployment

Deployed on Vercel or similar Node hosting.

Continuous builds from main branch.

Environment variables managed via dashboard.

Fully integrated client + server deployment.


#### 📹 Demo Guide

Demonstrate the workflow:

Open app and navigate through experiments.

View outputs and metrics per experiment.

Identify Best Fit response visually.

Export CSV/JSON/PDF.

Use Export Center to download all results.

Explore Docs page for parameter insights.

#### 🧾 License

MIT License — open for research, demos, and educational use.

#### ✨ Credits

Developed with Proud using Next.js, Tailwind, Prisma, and Express.
Focused on clarity, reproducibility, and a polished user experience.
