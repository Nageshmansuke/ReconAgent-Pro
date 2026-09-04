# DESIGN.md — ReconAgent Dashboard

The dashboard is a supporting artifact for the demo, not the main deliverable — keep this fast to build and clean, not elaborate. Substance over polish, but it should look intentional, not default-Bootstrap.

---

## 1. UI/UX Principles

- **One screen, no navigation.** Generate data, run reconciliation, view results — all visible or reachable without page transitions.
- **Numbers first.** The summary panel (match rate / precision / recall) should be the most visually prominent element — it's the headline of the pitch.
- **Exceptions are not an afterthought.** The exceptions table should be as easy to read as the success numbers — this system's honesty about what it couldn't resolve is a feature, not a weakness to hide.
- **Audit trail is progressive disclosure.** Show a compact table by default (record, status, resolving layer); let the user expand a row to see the full reasoning, rather than dumping the entire JSON log on screen.
- **State feedback.** Buttons ("Generate Data", "Run Reconciliation") should show a clear loading/running state — a judge watching the demo should never wonder if a click registered.
- **No dead ends.** If reconciliation hasn't been run yet, the results area should say so clearly, not show an empty table.

---

## 2. Colour & Theme

A dark, fintech-appropriate theme — echoes the tone of Razorpay's own buildathon page (near-black background, warm accent) without copying their exact assets.

| Role | Value | Use |
|---|---|---|
| Background | `#12100E` (near-black, warm) | Page background |
| Surface | `#1C1916` | Cards, panels, table rows |
| Border | `#2E2A25` | Dividers, table borders |
| Primary text | `#F2EDE4` (warm off-white) | Body text, headings |
| Secondary text | `#A39A8C` | Labels, captions |
| Accent | `#D9A94E` (warm gold) | Buttons, key metrics, highlights |
| Success | `#6FBF73` | Matched status |
| Warning | `#E0A63A` | Fuzzy-matched / AI-resolved status |
| Danger/Exception | `#D9634E` | Unresolved / exception status |

Status colors should be used consistently: a small colored dot or badge next to each record's resolving layer (exact / fuzzy / AI / unresolved) rather than coloring entire rows, to keep the table readable.

---

## 3. Fonts & Typography

- **Headings:** A clean system sans-serif stack — `-apple-system, "Segoe UI", Inter, sans-serif` (no custom font loading; keep zero external dependencies for speed).
- **Body/UI:** Same stack, regular weight, 14-16px base size.
- **Numbers (metrics panel):** Slightly larger, medium/semibold weight, tabular-nums if available, so match rate / precision / recall are scannable at a glance.
- **Monospace** (`ui-monospace, "SF Mono", Consolas, monospace`) for record IDs, reference numbers, and JSON snippets in the expanded audit view — makes technical fields visually distinct from prose.

Keep to 2-3 font sizes total (heading, body, small/caption) — do not introduce a large type scale for a single-screen utility dashboard.
