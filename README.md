# ReconAgent Pro
### AI Financial Controller & Multi-Source Reconciliation Engine

**Razorpay AI Buildathon 2026 — Track 04: AI Finance Controller**

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/status-live--operational-3DBD7D)
![License](https://img.shields.io/badge/license-MIT-blue)
![AI](https://img.shields.io/badge/AI-bounded%20%26%20auditable-4E7EF2)

ReconAgent Pro closes the loop that most finance teams still do by hand in spreadsheets: matching what your payment gateway actually settled against what your internal ledger says you sold. It does this with a **deterministic-first, three-layer pipeline** — exact match, then fuzzy match, then a strictly bounded AI escalation only for the genuinely ambiguous leftovers — and it reports its own accuracy honestly, exceptions included, instead of hiding what it couldn't resolve.

> **The core idea:** an LLM is the most expensive, least predictable way to solve a matching problem. So it's the *last* resort here, not the first — invoked only when deterministic logic has run out of options, capped in volume, schema-validated, and backed by a real fallback when it fails.

---

## Table of Contents
- [Why This Exists](#why-this-exists)
- [How It Maps to the Judging Criteria](#how-it-maps-to-the-judging-criteria)
- [Key Features](#key-features--highlights)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment--production-setup)
- [Testing & Verification](#testing--verification)
- [Sample Data for Live Testing](#sample-data-files-for-live-testing)
- [Sample Output](#sample-output)
- [Roadmap](#roadmap--whats-next)
- [License](#license--operational-usage)

---

## Why This Exists

Reconciliation is unglamorous, high-stakes, and still mostly manual. A payment gateway's settlement report rarely lines up perfectly with an internal sales ledger — fees get deducted, references get typo'd, settlements land days apart from the order, payments get split across multiple payouts, and every so often something genuinely fraudulent (like a reused UTR) slips into the pile.

Most "AI reconciliation" demos solve this by throwing every record at an LLM and hoping for the best. That's slow, expensive, and — worse — unauditable. ReconAgent Pro takes the opposite approach: **resolve everything that can be resolved deterministically, for free, and reserve AI for the handful of cases that genuinely need judgment** — with every decision logged, every exception surfaced, and every AI failure caught and handled gracefully instead of silently guessing.

---

## How It Maps to the Judging Criteria

| Criteria | How ReconAgent Pro answers it |
|---|---|
| **Problem Taste** | Reconciliation is a real, recurring finance-ops problem every payments company and merchant deals with — not a toy demo. |
| **Build Quality** | Clean layered architecture, unit-tested matchers, reproducible synthetic data, honest metrics computed against a real ground-truth key. |
| **AI Judgment** | AI is invoked *only* on records that survive two deterministic passes — bounded call volume, strict JSON schema, confidence thresholding. The system is designed to prove restraint, not showcase AI usage. |
| **Failure Recovery** | The AI escalation layer has a real, demonstrable fallback: a malformed response or timeout is caught and the record is marked "unresolved — flagged for human review," never silently mismatched or crashed on. |

---

## Key Features & Highlights

- **Deterministic-First Architecture**
  - **Layer 1 (Exact Match):** Matches exact UTRs, payment IDs, and fee-adjusted gross/net amounts. $0 AI cost.
  - **Layer 2 (Fuzzy Match):** Resolves reference/name typos and date drift using string similarity + a date window. $0 AI cost.
  - **Layer 3 (Bounded AI Escalation):** Calls an LLM (Gemini or Claude, configurable) *only* for genuinely ambiguous leftovers — capped call volume, schema-enforced output, confidence thresholding, graceful fallback on any failure.
- **Real-Time Interactive Control Room**
  - Clickable resolution-flow cards that jump straight into a pre-filtered Audit Trail or Exception view.
  - **Alert Inbox & Security Radar** — real-time detection of Ghost Settlements, UTR Reuse Attacks, and High-Value Spikes, with click-through navigation to the underlying records.
  - **Human Exceptions Management** — interactive *Force Match* and *Write-Off* actions that update reconciliation metrics and the persistent audit log in real time.
- **Ask Recon Copilot** — a natural-language finance assistant over your own reconciliation data, with a built-in zero-API-key fallback so the dashboard degrades gracefully rather than breaking when no key is configured.
- **CA Audit Certificate** — one-click generation of a certified, print/PDF-ready audit report summarizing the run.
- **Fully Auditable** — every single record, matched or not, is traceable to the exact layer and reasoning that resolved (or failed to resolve) it.

---

## System Architecture

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ Gateway Settlement File │     │   Sales Ledger File     │
│ (Razorpay / Stripe CSV) │     │ (Tally / QuickBooks CSV)│
└────────────┬────────────┘     └────────────┬────────────┘
             └──────────────┬────────────────┘
                             ▼
                 ┌───────────────────────┐
                 │ Layer 1: Exact Match  │  Exact UTR / Payment ID
                 │ (Deterministic, $0)   │  + Fee Tolerance
                 └───────────┬───────────┘
                             ▼ (Unmatched)
                 ┌───────────────────────┐
                 │ Layer 2: Fuzzy Match  │  String Similarity
                 │ (Deterministic, $0)   │  + Date Window
                 └───────────┬───────────┘
                             ▼ (Ambiguous Leftovers)
                 ┌───────────────────────┐
                 │ Layer 3: AI Escalation│  Bounded Gemini / Claude
                 │ (Schema Enforcement)  │  Confidence Capping + Fallback
                 └───────────┬───────────┘
                             ▼
                 ┌───────────────────────┐
                 │ Audit Log & Exception │  Match Rate, Precision,
                 │ Queue Management      │  Recall · Force Match / Write-Off
                 └───────────────────────┘
```

Each layer only ever sees what the layer before it failed to resolve — this is what keeps the AI layer small, cheap, bounded, and easy to audit.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Node.js + Express |
| Frontend | React + Tailwind CSS (Vite) |
| Fuzzy Matching | `string-similarity` |
| AI Escalation | Gemini or Anthropic Claude (configurable via `AI_PROVIDER`) |
| Storage | Flat JSON files — no database required |
| Testing | Node's native test runner (`node --test`) |

No database, no auth layer, no unnecessary dependencies — every tool in this stack earns its place.

---

## Project Structure

```
reconagent/
├── data/                     # generated settlement/ledger data, audit log, results
├── src/
│   ├── generator.js          # synthetic data generation
│   ├── matchers/
│   │   ├── exact.js          # Layer 1
│   │   ├── fuzzy.js          # Layer 2
│   │   └── aiEscalation.js   # Layer 3
│   ├── pipeline.js           # orchestrates all three layers
│   ├── metrics.js            # match rate / precision / recall vs ground truth
│   └── server.js             # Express app + API routes
├── frontend/                 # React + Tailwind dashboard
├── test/                     # unit + fallback tests
├── test_datasets/            # sample CSVs for live testing
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`

### Local Setup
```bash
# Install dependencies
npm install

# Build production frontend assets
npm run build

# Start the server
npm start
```

App runs at **`http://localhost:3000`**.

### Configuration
Copy `.env.example` to `.env` and fill in only what you need:
```env
PORT=3000
AI_PROVIDER=gemini            # 'gemini' or 'anthropic'
GEMINI_API_KEY=your_key_here  # optional — required only for Layer 3 / Copilot
ANTHROPIC_API_KEY=your_key_here
```
The app runs fully without any AI key configured — Layer 3 and the Copilot fall back gracefully, they don't block the rest of the pipeline.

---

## Deployment & Production Setup

ReconAgent Pro is ready for single-click deployment on Render, Railway, Fly.io, or Vercel.

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Port | Auto-injected via `process.env.PORT` |
| Required env vars | None — AI keys are optional |

---

## Testing & Verification

```bash
npm test
```

| Suite | Covers |
|---|---|
| `test/exact.test.js` | Clean matches, fee deductions, tolerance edge cases |
| `test/fuzzy.test.js` | Name/reference string similarity, date windowing |
| `test/aiEscalation.test.js` | Zero-API-key fallback, malformed response handling, timeout recovery |

---

## Sample Data Files for Live Testing

Two realistic sample datasets are included under [`test_datasets/`](./test_datasets), covering every reconciliation scenario the pipeline is designed to handle:

- [`gateway_settlements_sample.csv`](./test_datasets/gateway_settlements_sample.csv)
- [`internal_ledger_sample.csv`](./test_datasets/internal_ledger_sample.csv)

| Scenario | What it tests |
|---|---|
| Exact matches | Clean UTR/payment ID matches with fee-adjusted amounts |
| Fuzzy matches | Name typos, reference suffix mismatches, date drift, rounding differences |
| Ghost settlements | Money received with no corresponding ledger record |
| Missing settlements | Completed orders with no matching payout yet |
| UTR reuse | The same bank reference claimed across unrelated records — the core Security Radar trigger |
| Duplicate settlements | The same payment reprocessed/paid out twice |
| Split payments | One order settled across two separate payouts |

Use the **"Reconcile Files"** button on the dashboard header to upload these and see the full pipeline run live.

---

## Sample Output

```
Match Rate:  88.1%   (37 / 42 settlements resolved)
Precision:   0.94
Recall:      0.91
F1 Score:    0.92

Resolved by Layer:
  Exact Match     → 24 records
  Fuzzy Match     → 8 records
  AI Escalation   → 5 records
  Unresolved      → 5 records (flagged for human review)

Security Radar:
  ⚠ UTR Reuse Attack detected — UTR987654321200 claimed by 2 unrelated settlements
  ⚠ UTR Reuse Attack detected — UTR987654321201 claimed by 2 unrelated settlements
  ⚠ Ghost Settlement — SETTL_1032, SETTL_1033, SETTL_1034 have no matching ledger entry
```


## Roadmap / What's Next

- Live integration with Razorpay's Settlement API (currently synthetic-data only, by design, for this submission)
- Configurable fuzzy-match thresholds per merchant
- Multi-currency reconciliation support
- Exportable reconciliation reports (CSV/PDF) beyond the CA Audit Certificate

---

## License & Operational Usage

 Built for the Razorpay AI Buildathon 2026, Track 04 — AI Finance Controller.
