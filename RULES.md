# RULES.md — ReconAgent Build Rules

These rules govern every decision made while building this project. If a task in PHASES.md ever conflicts with a rule here, the rule wins.

---

## 1. What to Use

- Node.js + Express for all backend logic.
- Vanilla HTML/CSS/JS for the frontend. No framework.
- `string-similarity` for fuzzy matching.
- `@anthropic-ai/sdk` for the AI escalation layer only.
- Flat JSON files for all data storage.
- Environment variables (`.env`, never committed) for the Anthropic API key.
- Plain, readable, commented code over clever abstractions.
- Deterministic logic wherever a deterministic rule can decide the outcome.

## 2. What to Avoid

- No database of any kind (Postgres, Mongo, SQLite, etc.) — JSON files are sufficient at this scale.
- No authentication or user accounts.
- No React, Vue, Next.js, Vite, Webpack, or any build step for the frontend.
- No real Razorpay API calls (test-mode or otherwise) — this build is entirely synthetic-data based; do not add this scope under time pressure.
- No calling the AI layer before Layers 1 and 2 have had a chance to resolve a record. The AI layer only ever sees leftovers.
- No fabricated or cherry-picked metrics. If the real run produces a 78% match rate, the README says 78%, not "up to 95% in ideal conditions."
- No silently dropping unmatched or unresolved records from the output. Every input record must appear somewhere in the final results — matched, exception, or unresolved.
- No feature creep beyond what's listed in PRD.md as in-scope. A smaller system that fully works beats a bigger one that half-works.

## 3. Libraries & Dependencies

Only add a dependency if it removes real, otherwise-tedious work. Approved:
- `express`
- `string-similarity`
- `@anthropic-ai/sdk`
- `dotenv`
- `nodemon` (devDependency only)
- A minimal test runner (`node:test` preferred over adding `jest` as a dependency, unless jest is already comfortable)

Anything else needs a one-line justification in a commit message before it's added.

## 4. Error Handling

- Every call to the AI layer (Layer 3) must be wrapped in try/catch.
- If the AI response fails to parse as valid JSON, times out, or the API errors for any reason: catch it, log the failure reason, and mark that specific record as `"unresolved — flagged for human review"`. Never let an AI failure crash the pipeline or silently produce a wrong match.
- Validate the AI's JSON response against the expected schema (`match`, `matched_id`, `confidence`, `reason`) before trusting it. Treat a schema mismatch the same as a parse failure.
- Express routes should return clear error responses (4xx/5xx with a message), never an unhandled exception / stack trace to the client.
- The synthetic data generator should be deterministic enough to debug (consider a fixed random seed option) but should still produce realistic noise by default.

## 5. Boundaries of AI

- The AI layer (Layer 3) is invoked **only** for records that remain unresolved after both deterministic layers.
- Cap the number of AI calls per reconciliation run (e.g. 20 max) — this is a bounded, cheap escalation path, not the primary matching mechanism.
- The AI is asked to propose a match with a confidence score and a one-sentence reason — it is never asked to "just decide everything" or given the full unfiltered dataset.
- The AI's output does not override a deterministic match made by Layer 1 or 2 — it only acts on records that reached it because no deterministic rule could resolve them.
- Do not send unnecessary customer PII to the AI prompt beyond what's needed to disambiguate the match (e.g. don't send full addresses if name + amount + date suffices).
- If the AI returns low confidence (e.g. below a threshold like 0.6), treat it as unresolved rather than accepting a low-confidence guess as a match.

## 6. General Rules

- Test each layer in isolation before wiring it into the pipeline (exact match → test it alone → fuzzy match → test it alone → AI escalation → test it alone → then assemble `pipeline.js`).
- Commit incrementally as each phase in PHASES.md completes — a commit history that shows real incremental work is itself part of "Build Quality."
- Comment the *why*, not just the *what*, especially in the matcher files — a reviewer should be able to read `exact.js` and understand the tolerance/threshold reasoning without asking.
- Keep the dashboard visually clean but do not over-invest time in styling — this project is judged on substance, not polish.
- Update MEMORY.md at the end of each phase (or whenever something breaks and gets fixed) so there's a running record of decisions and issues for the README's "failure handled gracefully" section.
- When in doubt between "add a feature" and "make the existing pipeline more honest/robust," choose robustness.
