# MEMORY.md — ReconAgent Build Log

Living document. Update this at the end of every phase (see PHASES.md), and immediately whenever something breaks and gets fixed — this doubles as the raw material for the README's "failure handled gracefully" section and the pitch video's failure-case segment.

---

## How to use this file

Each entry should be short and factual: what happened, what you decided, what's still open. Don't rewrite history — append.

---

## Session Log

### [2026-09-04] — Phase 0: Scaffold
- **What happened:** Initialized repo structure, package.json with ES modules, installed approved dependencies (express, string-similarity, @anthropic-ai/sdk, dotenv, nodemon), set up .gitignore, .env.example, data/.gitkeep, README skeleton, and minimal Express server in src/server.js.
- **Decisions made:** Used ES modules ("type": "module") and Node's native runner `node --test` for testing.
- **Currently working:** Express server boots cleanly on port 3000.
- **Blockers/issues:** None.
- **Next step:** Phase 1: Synthetic Data Generator (src/generator.js).


### [2026-09-04] — Phase 1: Synthetic Data Generator
- **What happened:** Built `src/generator.js` producing realistic test data (72 gateway settlements, 69 internal ledger records, 76 ground truth answers). Included noise types: exact matches, fee-adjusted amounts, date drift (1-3 days), reference/name typos, split payments, duplicate settlements, missing settlements, and missing ledger entries.
- **Decisions made:** Implemented LCG pseudo-random generator with seed support for deterministic, reproducible test runs.
- **Currently working:** Generated data saved to `/data/gateway_settlements.json`, `/data/internal_ledger.json`, `/data/ground_truth.json`.
- **Blockers/issues:** None.
- **Next step:** Phase 2: Layer 1 (Exact Match matcher + unit tests).


### [2026-09-04] — Phase 2: Exact Match
- **What happened:** Implemented `src/matchers/exact.js` and unit tests in `test/exact.test.js`. Covered exact reference/UTR matches, fee deductions, and amount tolerance edge cases.
- **Decisions made:** Evaluated both gross and net/fee-adjusted amounts against gross order amounts with a 0.05 tolerance window.
- **Currently working:** All unit tests passing (`node --test test/exact.test.js`). Running exact.js against synthetic dataset yielded 63 matches, leaving 9 settlements and 6 ledger records for Phase 3.
- **Blockers/issues:** None.
- **Next step:** Phase 3: Layer 2 (Fuzzy Match matcher + unit tests).


### [2026-09-04] — Phase 3: Fuzzy Match
- **What happened:** Implemented `src/matchers/fuzzy.js` using `string-similarity` on names/refs/UTRs with date window (+/- 7 days) and exact amount matching. Added unit tests in `test/fuzzy.test.js`.
- **Decisions made:** Required composite score >= 0.75 for deterministic fuzzy match. Adjusted synthetic generator typo noise so typos affect both ref and UTR.
- **Currently working:** Unit tests passing (`node --test test/*.test.js`). Pipeline sequence L1 -> L2 resolves 56 exact matches + 7 fuzzy matches, leaving 9 settlements and 6 ledger records for Layer 3.
- **Blockers/issues:** None.
- **Next step:** Phase 4: Layer 3 (AI Escalation matcher + failure fallback test).


### [2026-09-04] — Phase 4: AI Escalation
- **What happened:** Implemented `src/matchers/aiEscalation.js` using `@anthropic-ai/sdk` with strict JSON schema validation, call caps, confidence thresholds, and try/catch fallback to `"unresolved — flagged for human review"`.
- **Decisions made:** Provided `simulateFailure` flag to deliberately trigger and test failure recovery. Handled missing API key gracefully without crashing.
- **Currently working:** Unit tests in `test/aiEscalation.test.js` passing. Forced-failure path tested and verified.
- **Blockers/issues (deliberate failure case details):** Tested forced failure case where AI response is malformed or API times out. System caught error, logged it, and correctly degraded the record to `"unresolved — flagged for human review (simulated AI timeout/parse error)"`.
- **Next step:** Phase 5: Pipeline + Metrics (src/pipeline.js, src/metrics.js, results.json & audit_log.json).


### [2026-09-04] — Phase 5: Pipeline + Metrics
- **What happened:** Built `src/metrics.js` and `src/pipeline.js` to orchestrate L1 -> L2 -> L3 and score predictions against ground truth. Output saved to `/data/results.json` and `/data/audit_log.json`.
- **Decisions made:** Evaluated match rate, precision (1.0), recall (0.913), F1 score (0.955), and layer breakdown.
- **Currently working:** Real run against synthetic data yields 87.5% match rate (56 exact, 7 fuzzy, 0 AI fallback, 9 unresolved settlements, 6 unresolved ledger records).
- **Blockers/issues:** None.
- **Next step:** Phase 6: API + Dashboard (Express API routes + vanilla HTML/CSS/JS dashboard).


### [2026-09-04] — Phase 6: API + Dashboard
- **What happened:** Implemented Express routes (`POST /api/generate`, `POST /api/reconcile`, `GET /api/results`) in `src/server.js` and single-page dashboard UI in `public/index.html`, `public/style.css`, and `public/app.js`.
- **Decisions made:** Adhered strictly to `DESIGN.md` (fintech dark theme `#12100E`, gold accents, KPI cards, layer execution steps, filterable audit log, honest exceptions list, zero frontend framework build steps).
- **Currently working:** API routes tested and functional; dashboard UI renders metrics and exceptions cleanly.
- **Blockers/issues:** None.
- **Next step:** Phase 7: Documentation (complete README.md).


### [Timestamp] — Phase 7: Documentation
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues:**
- **Next step:**

---

## Known Issues / Open Items
*(running list — move items here as soon as they're identified, cross off when resolved)*
-

## Decisions Log
*(one line per notable decision + why, for quick reference when writing the README's design-rationale section)*
-

## What's Definitely NOT Done (scope boundary reminder)
- No real Razorpay API integration
- No auth
- No database
- No frontend framework

## Final Pre-Submission State
- [ ] Match rate from last real run: ____%
- [ ] Precision: ____ | Recall: ____
- [ ] Failure case demonstrated and logged: Y/N
- [ ] Clean-clone test passed: Y/N
- [ ] Repo public: Y/N
- [ ] Video recorded and under 5:30: Y/N
