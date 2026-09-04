# PHASES.md — ReconAgent

Break the complete build into appropriate phases. Each phase has a goal, tasks, and an exit criterion — do not move to the next phase until the exit criterion is met. Total budget: ~14-15 focused hours within a <24 hour window.

---

### Phase 0 — Scaffold (≈1 hr)
**Goal:** A running, empty skeleton.
- Init `package.json`, install approved dependencies only (see RULES.md)
- Create folder structure per ARCHITECTURE.md
- `.env.example`, `.gitignore` (must exclude `.env` and generated `/data/*.json`)
- Empty README.md with section headers filled in, content TBD
**Exit criterion:** `npm start` runs an empty Express server without error.

---

### Phase 1 — Synthetic Data Generator (≈2 hrs)
**Goal:** Realistic, noisy, reproducible test data with a hidden answer key.
- Build `src/generator.js`
- Produce `gateway_settlements.json`, `internal_ledger.json`, `ground_truth.json`
- 60-80 record pairs with deliberate noise: ~50% clean exact matches, fee-adjusted amounts, 3-5 missing settlements, 2-3 duplicate rows, reference typos/mismatches, 2-3 split payments, date drift of 1-3 days
**Exit criterion:** Running the generator produces all three files; manually inspect a sample and confirm the noise types are actually present.

---

### Phase 2 — Layer 1: Exact Match (≈1.5 hrs)
**Goal:** Deterministic exact-match engine, tested in isolation.
- Build `src/matchers/exact.js`: match on ref/UTR equality + amount within tolerance
- Write unit tests covering: a clean match, an amount-tolerance edge case, a non-match
**Exit criterion:** Tests pass; running exact.js alone against generated data produces a plausible subset of matches (not 100%, not 0%).

---

### Phase 3 — Layer 2: Fuzzy Match (≈1.5 hrs)
**Goal:** Deterministic fuzzy-match engine on Layer 1's leftovers only.
- Build `src/matchers/fuzzy.js`: `string-similarity` on names/refs + amount tolerance + date window
- Unit tests: a fuzzy match that should resolve, one that correctly stays unresolved
**Exit criterion:** Running Layer 1 → Layer 2 in sequence further reduces the unmatched set; some records still deliberately remain unresolved for Layer 3.

---

### Phase 4 — Layer 3: AI Escalation (≈2 hrs)
**Goal:** Bounded, capped, fail-safe AI matching for genuine ambiguity.
- Build `src/matchers/aiEscalation.js` using `@anthropic-ai/sdk`
- Strict system prompt + JSON schema (`match`, `matched_id`, `confidence`, `reason`)
- Call cap (e.g. 20), confidence threshold, try/catch fallback to `"unresolved — flagged for human review"`
- Deliberately test a forced-failure path (malformed response / simulated timeout) and confirm graceful fallback
**Exit criterion:** A real run shows some records resolved by AI, and the forced-failure test shows a clean fallback, not a crash.

---

### Phase 5 — Pipeline + Metrics (≈1 hr)
**Goal:** Wire all three layers together and score against ground truth.
- Build `src/pipeline.js` (orchestration) and `src/metrics.js` (match rate, precision, recall)
- Build `data/audit_log.json` output: every record tagged with resolving layer + reason
**Exit criterion:** One full pipeline run produces `results.json` and `audit_log.json` with real, non-fabricated numbers.

---

### Phase 6 — API + Dashboard (≈2 hrs)
**Goal:** A working, minimal UI to demo live.
- Express routes: `POST /api/generate`, `POST /api/reconcile`, `GET /api/results`
- `public/index.html` + `app.js`: buttons to generate/run, summary panel, exceptions table, expandable audit trail
**Exit criterion:** Full flow works end-to-end by clicking through the browser, no console errors.

---

### Phase 7 — Documentation (≈1 hr)
**Goal:** README that stands on its own for a judge skimming the repo.
- Problem statement (2-3 sentences)
- Mermaid architecture diagram (reuse from ARCHITECTURE.md)
- "Why AI Judgment" section explaining the layering
- Setup/run instructions
- Real metrics output pasted from an actual run
**Exit criterion:** A stranger could clone the repo and run it using only the README.

---

### Phase 8 — Pitch Video (≈1 hr)
**Goal:** A tight 5-minute video per the script in the master plan.
**Exit criterion:** Recorded, under ~5:30, shows a live run and the failure case, not just slides.

---

### Phase 9 — Submission (≈0.5 hr)
**Goal:** Ship it.
- Push public repo with incremental commit history (not one giant final commit)
- Final checklist from the master plan (clean clone test, honest metrics, etc.)
- Submit via the official Google Form
**Exit criterion:** Form submitted, repo confirmed public and accessible from an incognito window.
