# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Lexi | Legal information, made legible

  Lexi is a focused legal-information assistant for people who need to understand a contract before speaking with a professional. It turns dense documents into plain-language summaries, cited answers, risk signals, comparisons, and practical questions to take to a lawyer.

  > Lexi provides information and preparation support, not legal advice. It does not replace a licensed attorney, and users should verify the original document and local law before acting.

  ## Challenge fit

  **Vertical:** AI for Legal Assistance & Access

  Lexi addresses the brief's core workflows:

  - **Simplify:** summaries, reading complexity, obligations, rights, and clause explanations.
  - **Compare:** side-by-side termination, liability, intellectual property, disputes, and material differences.
  - **Find risk:** severity-ranked clauses with source excerpt, explanation, and follow-up.
  - **Ask questions:** document-grounded Q&A with quoted evidence and confidence labels.
  - **Prepare next steps:** action checklists and questions for a legal professional.

  ## How it works

  1. A user selects a document from the library.
  2. The analysis engine scans it with a transparent clause lexicon and deterministic heuristics.
  3. Findings are ranked by severity and retain the source excerpt that triggered them.
  4. The UI turns findings into summaries, comparisons, answers, and an action plan.
  5. Optional Vercel Q&A calls NVIDIA Nemotron through a server-side function. The browser never receives the API key. If model mode is disabled or unavailable, the deterministic grounded answer remains available.

  The included documents are representative sample data so the project can be evaluated without uploading personal or confidential contracts.

  ## Responsible AI and security

  - Answers default to the local grounded engine; unsupported questions are reported instead of guessed.
  - Every detected clause includes an excerpt, severity, explanation, and recommendation.
  - Jurisdiction-sensitive topics are surfaced for professional review, not presented as universal conclusions.
  - NVIDIA mode is opt-in with `VITE_ENABLE_NVIDIA=true`; server credentials are read only from deployment environment variables.
  - Requests are bounded to prevent unexpectedly large prompts, and upstream failures return a safe fallback path.
  - The app consistently states the legal-information boundary and never asks users to submit private data in the demo.

  ## Run locally

  ```bash
  npm install
  npm run dev
  ```

  Checks:

  ```bash
  npm run lint
  npm run build
  ```

  ## Optional NVIDIA + Vercel deployment

  The server function is [api/ask.ts](api/ask.ts). Set these variables in Vercel Project Settings, never in committed source:

  ```text
  NVIDIA_API_KEY=your_key
  NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
  NEMOTRON_MODEL=nvidia/nemotron-3-ultra-550b-a55b
  VITE_ENABLE_NVIDIA=true
  ```

  Use Vercel's standard Vite preset. The frontend continues to work without the optional integration.

  ## Project structure

  ```text
  src/
    components/   Reusable analysis, navigation, and risk UI
    data/         Safe sample legal documents
    lib/          Deterministic analysis and Q&A engine
    pages/        Overview, library, simplify, compare, risks, Q&A, actions
  api/            Server-side NVIDIA proxy for optional model mode
  ```

  ## Assumptions and limitations

  - This prototype analyzes plain text sample documents; production ingestion needs secure upload, OCR, retention controls, and tenant isolation.
  - Heuristic extraction is explainable but is not legal research or attorney review.
  - Risk scores prioritize review; they do not predict enforceability or case outcome.
  - A production release should add authenticated storage, accessibility tests, audit logging, red-team tests, and a formal evaluation set across jurisdictions.

  ## Submission checklist

  - Publish this project as a **public** GitHub repository named `legaladvisor`.
  - Keep one branch only and verify the repository is under 10 MB before submission.
  - Add the final public Vercel URL to the submission form.
  - Do not commit `.env` files, API keys, private contracts, or generated build output.
