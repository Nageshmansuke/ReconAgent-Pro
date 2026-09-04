import React from 'react';
import { Cpu, Sparkles, Brain, AlertTriangle } from 'lucide-react';

export default function LayerBreakdown({ layerBreakdown }) {
  const exactCount = layerBreakdown?.exact || 0;
  const fuzzyCount = layerBreakdown?.fuzzy || 0;
  const aiCount = layerBreakdown?.ai || 0;
  const unresolvedCount = layerBreakdown?.unresolvedSettlements || 0;

  return (
    <div className="recon-card mb-6">
      <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
        Pipeline Layer Execution Breakdown
      </h2>

      <div className="grid-layers">
        {/* Layer 1: Exact Match */}
        <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="status-pill pill-exact">
                <Cpu className="w-3 h-3" /> Layer 1: Exact
              </span>
              <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{exactCount}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Deterministic Ref/UTR & Amount match ($0 AI cost)</p>
          </div>
          <div className="w-full bg-[var(--bg-main)] h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(100, exactCount * 5)}%` }}></div>
          </div>
        </div>

        {/* Layer 2: Fuzzy Match */}
        <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="status-pill pill-fuzzy">
                <Sparkles className="w-3 h-3" /> Layer 2: Fuzzy
              </span>
              <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{fuzzyCount}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">String similarity + date window ($0 AI cost)</p>
          </div>
          <div className="w-full bg-[var(--bg-main)] h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${Math.min(100, fuzzyCount * 15)}%` }}></div>
          </div>
        </div>

        {/* Layer 3: AI Escalation */}
        <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="status-pill pill-ai">
                <Brain className="w-3 h-3" /> Layer 3: AI Escalation
              </span>
              <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{aiCount}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Bounded Gemini/Claude AI on leftovers</p>
          </div>
          <div className="w-full bg-[var(--bg-main)] h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all" style={{ width: `${Math.min(100, aiCount * 25)}%` }}></div>
          </div>
        </div>

        {/* Exceptions Queue */}
        <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="status-pill pill-unresolved">
                <AlertTriangle className="w-3 h-3" /> Exceptions
              </span>
              <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{unresolvedCount}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Flagged for human review (Transparent)</p>
          </div>
          <div className="w-full bg-[var(--bg-main)] h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full transition-all" style={{ width: `${Math.min(100, unresolvedCount * 15)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
