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


### [Timestamp] — Phase 1: Synthetic Data Generator
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues:**
- **Next step:**

### [Timestamp] — Phase 2: Exact Match
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues:**
- **Next step:**

### [Timestamp] — Phase 3: Fuzzy Match
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues:**
- **Next step:**

### [Timestamp] — Phase 4: AI Escalation
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues (this is where the deliberate failure case should be logged in detail):**
- **Next step:**

### [Timestamp] — Phase 5: Pipeline + Metrics
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues:**
- **Next step:**

### [Timestamp] — Phase 6: API + Dashboard
- **What happened:**
- **Decisions made:**
- **Currently working:**
- **Blockers/issues:**
- **Next step:**

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
