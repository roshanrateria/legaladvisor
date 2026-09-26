# Lexi

## AI for Legal Assistance & Access

Lexi is a document-grounded legal information assistant. It helps people understand common contracts, compare versions, identify clauses worth reviewing, ask questions with source evidence, and prepare a focused agenda for a licensed legal professional.

> **Important:** Lexi provides general information and preparation support, not legal advice. It does not determine enforceability, predict an outcome, or replace a licensed attorney. Always check the original document, applicable jurisdiction, and current law before acting.

## Why this solves the challenge

Legal documents are often difficult to read and expensive to interpret. Lexi turns a contract into a sequence of understandable decisions:

1. **Understand:** plain-language summaries, reading complexity, parties, dates, rights, and obligations.
2. **Compare:** side-by-side differences in termination, liability, intellectual property, disputes, and other material topics.
3. **Prioritize:** severity-ranked risk findings with the exact source excerpt that triggered each finding.
4. **Ask:** natural-language questions answered from the selected document, with citations and confidence labels.
5. **Prepare:** practical next steps and questions to bring to a lawyer.

The app is designed for a person reviewing an employment agreement, lease, NDA, services agreement, loan, license, or terms of service. It uses safe sample documents by default so evaluators can explore every workflow without uploading confidential material.

## Product walkthrough

- **Overview:** entry point with the six supported workflows and the transparency promise.
- **Document Library:** browse representative legal documents and their risk/reading profiles.
- **Document Simplifier:** translate clauses into plain language while preserving source text.
- **Contract Comparator:** compare two documents by decision-relevant topics.
- **Risk Detector:** inspect high-impact clauses, explanations, severity, and recommended follow-up.
- **Legal Q&A:** ask a question and receive a grounded answer with quoted evidence when available.
- **Action Generator:** create a checklist and lawyer questions from the analysis.

## Decision logic

The local engine in `src/lib/legalEngine.ts` is deliberately explainable:

- A clause lexicon maps patterns such as liability caps, indemnities, arbitration, IP assignment, non-competes, auto-renewal, and penalties to structured findings.
- Each finding contains `category`, `severity`, `excerpt`, `explanation`, and `recommendation`.
- Findings are sorted by severity so the user sees the most consequential review items first.
- The Q&A engine first uses topic-specific responders, then scores keyword overlap against analyzed clauses.
- If evidence is missing, it returns a low-confidence answer that says it could not find a direct answer instead of inventing one.
- Jurisdiction-sensitive issues are framed as questions for professional review, not universal legal conclusions.

This is a prioritization and education system, not a legal research engine. Its risk score is a review signal, not a probability of liability or enforceability.

## AI architecture

The default experience is deterministic and document-grounded, which makes the demo reproducible and safe to evaluate. An optional NVIDIA Nemotron path is available through the Vercel server function in `api/ask.ts`:

```text
Browser Q&A -> /api/ask -> NVIDIA chat completions
                    \-> deterministic answer remains the fallback
```

The browser never receives `NVIDIA_API_KEY`. The server validates method, input types, document length, and question length before making an upstream request. Model instructions require document-only answers, uncertainty when unsupported, plain language, and a legal-information disclaimer.

## Responsible AI and security

- No API key, private contract, or user secret is committed to the repository.
- Demo content is synthetic/representative sample data.
- The model integration is opt-in with `VITE_ENABLE_NVIDIA=true`.
- Upstream failures do not break the app; the grounded local answer remains available.
- Prompts are bounded to reduce accidental cost and denial-of-service risk.
- Citations come from document excerpts in the local engine; model-generated prose is not treated as proof.
- The interface repeats that outputs are information, not advice.
- Production work would add authentication, encrypted storage, retention controls, tenant isolation, audit logs, upload malware scanning, and privacy review.

## Accessibility and usability

- The application uses semantic headings, navigation, sections, forms, labels, focus styles, and a keyboard skip link.
- Color is paired with text labels such as risk level and confidence; color is not the only signal.
- The layout is responsive from mobile navigation through wide desktop analysis views.
- Motion is limited and the primary workflows remain usable with reduced-motion preferences supplied by the browser.
- The remaining production accessibility gate should include automated axe checks and manual keyboard/screen-reader review across all routes.

## Run locally

Requirements: Node.js 20+, npm, and a modern browser.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. No API key is needed for the default demo mode.

## Validation

```bash
npm run build
npm run test
npm run lint
```

`npm run test` covers deterministic document analysis, severity ordering, citations, unsupported-question behavior, and document comparison. The build and lint commands provide the compile and quality gates for the prototype.

### Evaluation evidence

| Evaluation area | Evidence in this repository | Verification |
| --- | --- | --- |
| Code quality | Typed React components, focused engine module, shared UI components, clean lint gate | `npm run lint` |
| Security | Server-only NVIDIA secret, bounded requests, no committed secrets, patched dependencies | `npm audit --omit=dev` |
| Efficiency | Cached document analysis, one-pass sentence tokenization, bounded 24,000-character model context, per-session Q&A response cache, no model call in demo mode | Inspect `src/lib/legalEngine.ts`, `src/pages/QA.tsx`, and `api/ask.ts` |
| Testing | Four behavioral tests for detection, citations, uncertainty, and comparison | `npm test` |
| Accessibility | Semantic landmarks, labelled controls, keyboard skip link, visible focus treatment, text labels for risk/confidence | Inspect `src/App.tsx` and run a keyboard/screen-reader review |
| Problem alignment | Six end-to-end legal workflows with source excerpts, actions, and professional-review boundaries | Explore routes from the Overview page |

The current automated verification result is: **4 tests passed, build passed, lint passed, and zero npm audit vulnerabilities**. Manual accessibility review remains a human responsibility because automated checks cannot prove screen-reader quality.

## NVIDIA + Vercel deployment

Deploy the Vite project using Vercel's standard Vite preset. Add these environment variables in Vercel Project Settings, never in source control:

```text
NVIDIA_API_KEY=replace_with_a_rotated_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NEMOTRON_MODEL=nvidia/nemotron-3-ultra-550b-a55b
VITE_ENABLE_NVIDIA=true
```

The public demo works without the optional integration. If a key has ever been exposed publicly, revoke it and issue a replacement before deployment.

## Repository structure

```text
api/ask.ts                 Server-side NVIDIA proxy
src/components/            Shared cards, navigation, badges, and gauges
src/data/sampleDocuments.ts Safe representative documents
src/lib/legalEngine.ts     Explainable analysis, comparison, and Q&A logic
src/pages/                 Overview and task-focused workflows
tests/                     Executable engine tests
```

## Assumptions and limitations

- Input is currently the included plain text sample library; secure upload/OCR is future production work.
- Heuristics can miss unusual drafting and do not establish legal conclusions.
- The optional model can be wrong; its response must be checked against the source document.
- Jurisdiction, role, negotiation context, and facts outside the document can change the answer.
- The correct next step for a consequential decision is review by a qualified professional.

## Submission checklist

- Public repository: `https://github.com/roshanrateria/legaladvisor`
- Production URL: `https://legal-chi-eight.vercel.app`
- One branch only: `master`
- Keep the repository under 10 MB; do not commit `node_modules`, `dist`, `.env`, keys, or private documents.
- Run `npm run build` and `npm run test` before each submission attempt.
- Use the challenge submission form to provide the repository and deployed URL.

## License

This prototype is provided for challenge evaluation and demonstration. Add a project license before broader redistribution.
