import React from 'react';
import { Cpu, Sparkles, Brain, AlertTriangle } from 'lucide-react';

export default function LayerBreakdown({ layerBreakdown }) {
  const exactCount = layerBreakdown?.exact || 0;
  const fuzzyCount = layerBreakdown?.fuzzy || 0;
  const aiCount = layerBreakdown?.ai || 0;
  const unresolvedCount = layerBreakdown?.unresolvedSettlements || 0;

  return (
    <div className="glass-panel p-6 mb-6">
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>Pipeline Layer Execution Breakdown</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Layer 1: Exact Match */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-emerald-500/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-chip badge-exact">
              <Cpu className="w-3 h-3" /> Layer 1: Exact
            </span>
            <span className="text-xl font-black text-[var(--text-primary)] font-mono">{exactCount}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Deterministic Ref/UTR & Amount match ($0 AI cost)</p>
          <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, exactCount * 5)}%` }}></div>
          </div>
        </div>

        {/* Layer 2: Fuzzy Match */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-amber-500/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-chip badge-fuzzy">
              <Sparkles className="w-3 h-3" /> Layer 2: Fuzzy
            </span>
            <span className="text-xl font-black text-[var(--text-primary)] font-mono">{fuzzyCount}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3">String similarity + date window ($0 AI cost)</p>
          <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, fuzzyCount * 15)}%` }}></div>
          </div>
        </div>

        {/* Layer 3: AI Escalation */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-indigo-500/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-chip badge-ai">
              <Brain className="w-3 h-3" /> Layer 3: AI Escalation
            </span>
            <span className="text-xl font-black text-[var(--text-primary)] font-mono">{aiCount}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Bounded Gemini/Claude AI on leftovers</p>
          <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, aiCount * 25)}%` }}></div>
          </div>
        </div>

        {/* Exceptions Queue */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-rose-500/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-chip badge-unresolved">
              <AlertTriangle className="w-3 h-3" /> Exceptions
            </span>
            <span className="text-xl font-black text-[var(--text-primary)] font-mono">{unresolvedCount}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Flagged for human review (Transparent)</p>
          <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, unresolvedCount * 15)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
