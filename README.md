# ReconAgent Pro — AI Financial Controller & Multi-Source Reconciliation Engine

ReconAgent Pro is an enterprise-grade multi-source financial reconciliation agent that matches gateway settlement reports against internal sales ledgers using a high-precision, three-layer execution pipeline.

---

## Key Features & Highlights

- **Deterministic-First Architecture:**
  - **Layer 1 (Exact Match):** Matches exact UTRs, payment IDs, and fee-adjusted gross/net amounts at $0 AI cost.
  - **Layer 2 (Fuzzy Match):** Matches slight reference/name typos and date drift (+/- 7 days) at $0 AI cost.
  - **Layer 3 (Bounded AI Escalation):** Calls Google Gemini / Anthropic Claude *only* for genuine ambiguous leftovers that deterministic logic cannot resolve.
- **Real-Time Interactive Control Room:**
  - **Clickable Resolution Flow:** Overview flow cards redirect directly to pre-filtered Audit Trail or Exception views.
  - **Alert Inbox & Security Radar:** Real-time threat detection (*Ghost Settlements*, *UTR Reuse Attacks*, *High-Value Spikes*) with clickable navigation.
  - **Human Exceptions Management:** Interactive **Force Match** and **Write-Off** modal actions that update reconciliation metrics and persistent audit logs in real time.
- **Ask Recon Copilot:** Natural language finance assistant with a built-in zero-key fallback engine.
- **CA Audit Certificate:** Instant generation and print/PDF download of certified statutory audit reports.

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
                │ (Deterministic, $0)   │  + Date Window (+/- 7d)
                └───────────┬───────────┘
                            ▼ (Ambiguous Leftovers)
                ┌───────────────────────┐
                │ Layer 3: AI Escalation│  Bounded Gemini / Claude AI
                │ (Schema Enforcement)  │  Strict Confidence Capping
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │ Audit Log & Exception │  Match Rate, Precision,
                │ Queue Management      │  Recall, Force Match / Write-Off
                └───────────────────────┘
```

---

## Deployment & Production Setup

### 1. Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`

### 2. Local Setup
```bash
# Install dependencies
npm install

# Build production frontend assets
npm run build

# Start production server
npm start
```
Access the application at **`http://localhost:3000`**.

---

### 3. Deploying Live (Render, Railway, Fly.io, Vercel)

ReconAgent Pro is production-ready for single-click cloud deployment.

#### Deployment Settings:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Port:** Auto-injected via `process.env.PORT`

#### Environment Variables (Optional):
```env
PORT=3000
AI_PROVIDER=gemini # 'gemini' or 'anthropic'
GEMINI_API_KEY=AIzaSy... # Optional: Google AI Studio Key for Layer 3 & Copilot
ANTHROPIC_API_KEY=sk-ant-api... # Optional: Anthropic API Key
```

---

## Testing & Verification

### Running Automated Unit Tests
ReconAgent uses Node's native test runner (`node --test`):
```bash
npm test
```

Included unit test suites:
- **Exact Matcher (`test/exact.test.js`):** Clean matches, fee deductions, and tolerance checks.
- **Fuzzy Matcher (`test/fuzzy.test.js`):** Name/ref string similarity and date windowing.
- **AI Escalation & Fallback (`test/aiEscalation.test.js`):** Zero-API key fallback and timeout recovery.

---

## Sample Data Files for Live Testing

Two sample CSV files are included in the repository under [`test_datasets/`](file:///d:/nages/Desktop/razor/test_datasets):
1. **[gateway_settlements_sample.csv](file:///d:/nages/Desktop/razor/test_datasets/gateway_settlements_sample.csv)**
2. **[internal_ledger_sample.csv](file:///d:/nages/Desktop/razor/test_datasets/internal_ledger_sample.csv)**

Use the **"Reconcile files"** button on the dashboard header to upload these files and test real-time reconciliation.

---

## License & Operational Usage

Protected operational software. Configured for production deployment.
