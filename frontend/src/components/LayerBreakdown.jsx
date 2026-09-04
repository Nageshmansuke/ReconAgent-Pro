import React from 'react';

export default function LayerBreakdown({ layerBreakdown }) {
  const exactCount = layerBreakdown?.exact || 0;
  const fuzzyCount = layerBreakdown?.fuzzy || 0;
  const aiCount = layerBreakdown?.ai || 0;
  const unresolvedCount = layerBreakdown?.unresolvedSettlements || 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
        Pipeline Layer Execution
      </div>

      <div className="stepped-funnel">
        {/* Layer 1: Exact */}
        <div className={`funnel-step ${exactCount > 0 ? 'resolved-active' : ''}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Layer 1: Exact Match</span>
            <span className="font-mono-numbers text-base font-semibold text-[var(--text-primary)]">{exactCount}</span>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)]">Deterministic Ref/UTR ($0 AI cost)</span>
        </div>

        {/* Layer 2: Fuzzy */}
        <div className={`funnel-step ${fuzzyCount > 0 ? 'resolved-active' : ''}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Layer 2: Fuzzy Match</span>
            <span className="font-mono-numbers text-base font-semibold text-[var(--text-primary)]">{fuzzyCount}</span>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)]">String similarity + date window</span>
        </div>

        {/* Layer 3: AI Escalation */}
        <div className={`funnel-step ${aiCount > 0 ? 'resolved-active' : ''}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Layer 3: AI Escalation</span>
            <span className="font-mono-numbers text-base font-semibold text-[var(--text-primary)]">{aiCount}</span>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)]">Bounded Gemini/Claude LLM</span>
        </div>

        {/* Exceptions */}
        <div className={`funnel-step ${unresolvedCount > 0 ? 'border-b-2 border-b-[var(--color-danger)]' : ''}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Exceptions Queue</span>
            <span className={`font-mono-numbers text-base font-semibold ${unresolvedCount > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--text-primary)]'}`}>
              {unresolvedCount}
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)]">Flagged for human review</span>
        </div>
      </div>
    </div>
  );
}
