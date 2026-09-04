# ReconAgent — AI Finance Controller (Multi-Source Reconciliation)

> Razorpay AI Buildathon — Track 04: AI Finance Controller

## 1. Problem Statement
*TBD*

## 2. Architecture
```mermaid
graph TD
    A[gateway_settlements.json] --> C[Layer 1: Exact Match JS]
    B[internal_ledger.json] --> C
    C -->|Resolved| F[Audit Log & Results]
    C -->|Unmatched| D[Layer 2: Fuzzy Match JS]
    D -->|Resolved| F
    D -->|Ambiguous| E[Layer 3: AI Escalation Capped]
    E -->|Resolved / Fallback| F
    F --> G[Express API & Dashboard]
```

## 3. Why AI Judgment?
*TBD*

## 4. Setup & Running Locally
*TBD*

## 5. Running Tests
*TBD*

## 6. Deployment (Render / Railway)
*TBD*

## 7. Measured Performance & Results
*TBD*
