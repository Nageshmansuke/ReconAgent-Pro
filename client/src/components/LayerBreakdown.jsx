import React from 'react';
import { Cpu, Sparkles, Brain, AlertTriangle } from 'lucide-react';

export default function LayerBreakdown({ layerBreakdown }) {
  const exactCount = layerBreakdown?.exact || 0;
  const fuzzyCount = layerBreakdown?.fuzzy || 0;
  const aiCount = layerBreakdown?.ai || 0;
  const unresolvedCount = layerBreakdown?.unresolvedSettlements || 0;

  return (
    <div className="glass-panel p-6 mb-6">
      <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <span>Pipeline Layer Execution Breakdown</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Layer 1: Exact Match */}
        <div className="bg-[#0A0C10] border border-[#1E2532] hover:border-[#10B981]/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-pill badge-exact">
              <Cpu className="w-3 h-3" /> Layer 1: Exact
            </span>
            <span className="text-xl font-bold text-white font-mono">{exactCount}</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-3">Deterministic Ref/UTR & Amount match ($0 AI cost)</p>
          <div className="w-full bg-[#1E2532] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#10B981] h-full" style={{ width: `${Math.min(100, exactCount * 2)}%` }}></div>
          </div>
        </div>

        {/* Layer 2: Fuzzy Match */}
        <div className="bg-[#0A0C10] border border-[#1E2532] hover:border-[#F5C453]/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-pill badge-fuzzy">
              <Sparkles className="w-3 h-3" /> Layer 2: Fuzzy
            </span>
            <span className="text-xl font-bold text-white font-mono">{fuzzyCount}</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-3">String similarity + date window ($0 AI cost)</p>
          <div className="w-full bg-[#1E2532] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F5C453] h-full" style={{ width: `${Math.min(100, fuzzyCount * 10)}%` }}></div>
          </div>
        </div>

        {/* Layer 3: AI Escalation */}
        <div className="bg-[#0A0C10] border border-[#1E2532] hover:border-[#38BDF8]/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-pill badge-ai">
              <Brain className="w-3 h-3" /> Layer 3: AI Escalation
            </span>
            <span className="text-xl font-bold text-white font-mono">{aiCount}</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-3">Bounded Gemini/Claude AI on leftovers</p>
          <div className="w-full bg-[#1E2532] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#38BDF8] h-full" style={{ width: `${Math.min(100, aiCount * 20)}%` }}></div>
          </div>
        </div>

        {/* Exceptions Queue */}
        <div className="bg-[#0A0C10] border border-[#1E2532] hover:border-[#F43F5E]/40 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="badge-pill badge-unresolved">
              <AlertTriangle className="w-3 h-3" /> Exceptions
            </span>
            <span className="text-xl font-bold text-white font-mono">{unresolvedCount}</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-3">Flagged for human review (Transparent)</p>
          <div className="w-full bg-[#1E2532] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F43F5E] h-full" style={{ width: `${Math.min(100, unresolvedCount * 10)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
