# ReconAgent Pro — User Guide & Feature Manual

Welcome to **ReconAgent Pro**, an enterprise-grade multi-source financial reconciliation workspace designed for finance-ops teams, CFOs, and auditors. ReconAgent Pro automates the matching of payment-gateway settlement statements against internal sales ledgers using a **deterministic-first, 3-layer execution engine**.

---

## 📖 Table of Contents
1. [Quick Start — How to Launch](#1-quick-start--how-to-launch)
2. [How to Use the Application (Step-by-Step)](#2-how-to-use-the-application-step-by-step)
3. [Key Features & Capabilities](#3-key-features--capabilities)
4. [Control Room Navigation & Tabs](#4-control-room-navigation--tabs)
5. [Exception Queue Management (Force Match & Write-Off)](#5-exception-queue-management-force-match--write-off)
6. [Ask Recon Copilot (AI Assistant)](#6-ask-recon-copilot-ai-assistant)
7. [CA Audit Certificate Generation](#7-ca-audit-certificate-generation)
8. [Sample Data Templates](#8-sample-data-templates)

---

## 1. Quick Start — How to Launch

### Running Locally
1. Open your terminal in the project directory.
2. Start the local server:
   ```bash
   npm start
   ```
3. Open your browser and navigate to: **`http://localhost:3000`**

### Live Deployment
ReconAgent Pro is ready for one-click cloud deployment on **Render** or **Railway**:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment Variable (Optional):** `GEMINI_API_KEY` = *your_google_ai_key*

---

## 2. How to Use the Application (Step-by-Step)

### Step 1: Data Ingestion (Two Options)
- **Option A — Instant Demo Run:** Click **"Generate demo"** on the Overview hero banner to create a sample dataset of 70+ settlements with real-world noise (fee deductions, date drifts, typos). Then click **"Run pipeline"**.
- **Option B — Upload Real CSV/JSON Files:** Click **"Reconcile files"** in the top-right header to upload your Gateway Settlement statement (Razorpay/Stripe) and Sales Ledger file (Tally/QuickBooks). Click **"Run Real-Time Reconciliation"**.

### Step 2: Review Overview KPIs
- Monitor your **Match Rate (%)**, **Precision**, **Recall**, **F1 Score**, and **Pipeline Execution Latency (ms)** in the KPI cards.
- View the **Resolution Flow** step cards (`01 Exact match`, `02 Fuzzy match`, `03 AI escalation`, `04 Human queue`).
- **Click any Flow Card** to immediately jump to the Audit Trail or Exceptions view pre-filtered for that category!

### Step 3: Check Alert Inbox & Security Radar
- Switch to **Alert Inbox** to see dynamic risk signals like high-value exceptions or fee overcharges. **Clicking any alert** takes you directly to the relevant review queue.
- Switch to **Security Radar** to inspect automated threat signals (*Ghost Settlements*, *UTR Reuse Attacks*, *High-Value Spikes*).

### Step 4: Resolve Unmatched Exceptions
- Switch to **Exceptions Queue** to view open financial exposure.
- Click **"Force match"** to manually link a settlement to an internal order ID.
- Click **"Write off"** to record an audited write-off note.
- Watch your KPIs and exposure totals update in real-time!

### Step 5: Ask Recon Copilot
- Type questions in natural English like *"Summarize CFO action items"* or *"Total gateway fee deductions?"* into the Copilot box.

### Step 6: Export CA Audit Certificate
- Click the floating **"Audit certificate"** button in the bottom-right corner to preview, save, or print an official CA-certified reconciliation report.

---

## 3. Key Features & Capabilities

### ⚡ 1. Deterministic-First 3-Layer Pipeline
- **Layer 1 — Exact Match ($0 AI Cost):** Matches exact UTRs, payment references, and gross/net fee deductions in milliseconds. Over 85% of transactions clear here.
- **Layer 2 — Fuzzy Match ($0 AI Cost):** Resolves customer name/ref typos and bank settlement date lags (+/- 7 days) using string similarity algorithms.
- **Layer 3 — Bounded AI Escalation:** Calls Google Gemini (`gemini-2.0-flash`) or Claude AI *only* for remaining ambiguous leftovers, bounded by strict confidence capping.

### 🛡️ 2. Automated Fraud & Security Engine
- **Ghost Settlement Detection:** Identifies bank deposits landing without matching internal order entries.
- **UTR Reuse Attack Protection:** Catches recycled UTRs attached across different customer names.
- **High-Value Transaction Spike Alert:** Flags transactions exceeding 3x average volume for dual CFO sign-off.

### 📜 3. Statutory Audit & Compliance Certification
- **Untampered Audit Log:** Stores per-record resolution layer, confidence score, timestamp, and human-readable explanation.
- **Printable CA Audit Certificate:** Generates a statutory compliance certificate with issuer ID, issuing date, KPI metrics, and exception ledger.

---

## 4. Control Room Navigation & Tabs

| Tab | Purpose & Features |
|---|---|
| 📊 **Overview** | High-level metrics, health progress ring, interactive resolution flow cards, Ask Recon Copilot. |
| 🔔 **Alert Inbox** | Real-time financial risk alerts with clickable recommendation actions. |
| 🛡️ **Security Radar** | Threat surface detection (*Ghost payouts, UTR recycling, volume spikes*). |
| 📋 **Audit Trail** | Per-record log with dropdown filtering (`Exact`, `Fuzzy`, `AI`, `Exceptions`, `Human`) & search. |
| ⚠️ **Exceptions** | Human review queue with open exposure calculation and Force Match / Write-Off controls. |

---

## 5. Exception Queue Management (Force Match & Write-Off)

When a settlement record cannot be automatically matched, it lands in the **Human Review Queue**:

1. **Force Match:**
   - Click **"Force match"** on any exception card.
   - Enter the internal order ID (e.g. `ORD_MANUAL_1001`) and an optional manager note.
   - Click **Confirm Force Match**. The system moves the record to matched status, updates match rates, and logs the human resolution persistently.

2. **Write-Off:**
   - Click **"Write off"** on any exception card.
   - Enter an audit note explaining the write-off reason.
   - Click **Confirm Write Off**. The exposure is cleared and logged in the persistent audit log.

---

## 6. Ask Recon Copilot (AI Assistant)

Recon Copilot features a **Dual-Engine Architecture**:
- **With AI API Key (`GEMINI_API_KEY`):** Powered by Google Gemini (`gemini-2.0-flash`) for open-ended natural language finance queries.
- **Without API Key (Zero-Key Mode):** Uses a built-in **Smart Deterministic Fallback Engine** that analyzes live dataset metrics to answer queries about fees, match rates, largest exceptions, and CFO action items.

---

## 7. CA Audit Certificate Generation

Click the **"Audit certificate"** floating action button to display the **Statutory Financial Reconciliation & Audit Certificate**:
- Includes unique Certificate ID (e.g. `CERT_K9X2A8`) and timestamp.
- Certifies match rate, precision, recall, and F1 score under statutory audit standards.
- Lists open exception queue for Chartered Accountant (CA) and Finance Controller signatures.
- Click **"Print / Save PDF Certificate"** for immediate paper or PDF export.

---

## 8. Sample Data Templates

If creating custom CSV test files:

### Gateway Settlement CSV Format:
```csv
settlement_id,utr,payment_id,amount,fee,net_amount,settlement_date,customer_name,status
SETTL_1001,UTR987654321001,pay_101,1500,30,1470,2026-08-15T10:00:00Z,Rahul Sharma,settled
```

### Sales Ledger CSV Format:
```csv
internal_id,payment_ref,utr,gross_amount,order_date,customer_name,status
ORD_5001,pay_101,UTR987654321001,1500,2026-08-15T10:00:00Z,Rahul Sharma,COMPLETED
```
