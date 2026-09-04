# PRD.md — ReconAgent
**Razorpay AI Buildathon — Track 04: AI Finance Controller**

---

## 1. What to Build

**ReconAgent** is a multi-source reconciliation agent that matches a synthetic payment-gateway settlement file against a synthetic internal order ledger, using a three-layer pipeline:

1. **Exact match** (deterministic, zero AI cost)
2. **Fuzzy match** (deterministic, zero AI cost)
3. **AI escalation** (bounded — only for genuinely ambiguous leftovers)

The system reports its **match rate, precision, and recall against a hidden ground-truth answer key**, and produces an **honest exceptions list** for everything it could not resolve — it never hides or discards unmatched records.

The point of the build is not "an AI that reconciles everything." It's a system that uses AI *only* where deterministic logic genuinely can't decide, and is transparent about what it couldn't solve.

**One-line pitch:** *"A reconciliation agent that only calls an LLM when it's actually stuck — and tells you honestly when even the LLM couldn't help."*

---

## 2. Targeted User

- **Primary (real-world):** A finance-ops / accounts team at a merchant or payments company who currently reconciles settlement reports against internal ledgers by hand in spreadsheets — slow, error-prone, and with no audit trail of *why* a match was accepted.
- **Primary (for this submission):** The Razorpay buildathon judging panel — engineers evaluating Problem Taste, Build Quality, AI Judgment, and Failure Recovery. Every design choice in this project is made with this audience in mind as much as the hypothetical end user.
- **Secondary (future extension):** Could plug into Razorpay's actual Settlement API for a merchant's real settlement data instead of synthetic data — noted as a "what I'd do next" in the pitch, not built now.

---

## 3. Features

### Core (must-have, in scope for this build)
- Synthetic data generator producing two realistic, noisy datasets + a hidden ground-truth key
- Layer 1: deterministic exact match engine
- Layer 2: deterministic fuzzy match engine
- Layer 3: bounded, capped AI escalation with strict JSON schema and a real fallback on failure
- Metrics computation against ground truth: match rate, precision, recall
- Honest exceptions list with plain-English reason per unresolved record
- Per-record audit log: which layer resolved it, and why
- Minimal dashboard: generate data, run reconciliation, view results, view audit trail
- One deliberately engineered and demonstrated failure case (AI response fails → graceful fallback, not a crash)

### Explicitly out of scope (do not build these — see RULES.md)
- User authentication / accounts
- Real Razorpay API integration (test-mode or otherwise)
- A database (JSON files only)
- Any frontend framework or build tooling
- Multi-user / multi-tenant support
- Anything not directly needed to demonstrate the pipeline and its honesty about accuracy

### Success criteria for this build
- `npm install && npm start` works from a clean clone, first try
- Match rate is a real, computed number from an actual run — not fabricated
- The exceptions list is non-empty and each reason is genuinely explanatory
- The failure-recovery case can be shown live, not just described
