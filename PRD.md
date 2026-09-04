# PRD — ReconAgent Pro

**ReconAgent Pro: Multi-Source Financial Reconciliation Engine & AI Control Room**

---

## 1. Product Overview

**ReconAgent Pro** is an enterprise-grade multi-source reconciliation agent designed to automate the match process between payment-gateway settlement statements and internal sales order ledgers using a high-precision, three-layer execution pipeline:

1. **Layer 1 (Exact Match):** Deterministic matching on exact UTRs, payment references, and net fee-adjusted amounts at zero AI cost.
2. **Layer 2 (Fuzzy Match):** Deterministic matching on reference/name typos and date drift (+/- 7 days) at zero AI cost.
3. **Layer 3 (Bounded AI Escalation):** Bounded LLM evaluation (Google Gemini / Anthropic Claude) *only* for genuine ambiguous leftovers that deterministic logic cannot resolve.

The system evaluates real-time **match rate, precision, recall, and F1 score**, producing an **honest audit trail and human review queue** for unresolved exceptions.

---

## 2. Target Audience

- **Finance Operations & Accounting Teams:** Merchants, fintechs, and e-commerce companies managing high-volume payment settlement reconciliations across gateways (Razorpay, Stripe, Paytm, HDFC) and ERPs (Tally, QuickBooks, SAP).
- **CFOs & Finance Controllers:** Operations managers requiring live oversight of net bank deposits, open exception exposures, fee rate overcharges, and fraud signals.

---

## 3. Core Features & Capabilities

- **Real-Time Data Upload & Processing:** Drag-and-drop CSV or JSON files for gateway settlement statements and sales ledgers.
- **Deterministic-First Layering:** Processes >85% of standard transactions instantly in milliseconds at $0 AI cost.
- **Interactive Control Room:**
  - **Overview Tab:** Live KPIs (Match Rate, Precision, Recall, Latency) and clickable resolution flow steps.
  - **Alert Inbox Tab:** Dynamic real-time risk notifications with interactive recommendation actions.
  - **Security Radar Tab:** Automated fraud detection (Ghost Settlements, UTR Reuse Attacks, High-Value Spikes).
  - **Audit Trail Tab:** Traceable log with criteria filtering (`Exact`, `Fuzzy`, `AI`, `Exceptions`, `Human`).
  - **Human Exceptions Queue:** Interactive **Force Match** and **Write-Off** management with real-time persistent updates.
- **Ask Recon Copilot:** Natural language finance assistant powered by LLM inference (with built-in deterministic fallback).
- **CA Audit Certificate:** Instant generation and print/PDF download of certified reconciliation audit reports.

---

## 4. Operational Architecture & Deployment

- **Node.js + Express backend** hosting an optimized single-page React client (`Vite` production bundle served from `/public`).
- **Zero database setup required**: Lightweight persistent flat JSON storage engine.
- **Cloud Deployable**: Ready for immediate single-click deployment on Render, Railway, Vercel, Fly.io, or AWS.
