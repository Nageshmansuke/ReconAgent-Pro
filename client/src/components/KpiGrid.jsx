import React from 'react';
import { TrendingUp, CheckCircle2, Target, Zap } from 'lucide-react';

export default function KpiGrid({ metrics }) {
  const matchRate = metrics?.matchRate !== undefined ? `${metrics.matchRate}%` : '--%';
  const precision = metrics?.precision !== undefined ? metrics.precision : '--';
  const recall = metrics?.recall !== undefined ? metrics.recall : '--';
  const f1 = metrics?.f1Score !== undefined ? metrics.f1Score : '--';
  const totalMatched = metrics?.totalMatched || 0;
  const totalSettlements = metrics?.totalSettlements || 0;
  const execTime = metrics?.executionTimeMs !== undefined ? `${metrics.executionTimeMs}ms` : '--';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Match Rate */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Match Rate</span>
          <div className="p-2 rounded-lg bg-[#F5C453]/10 text-[#F5C453]">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#F5C453] tracking-tight mb-1 font-mono">
          {matchRate}
        </div>
        <div className="text-xs text-[#9CA3AF]">
          {totalMatched} / {totalSettlements} settlements matched
        </div>
      </div>

      {/* KPI 2: Precision */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Precision</span>
          <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#34D399]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#34D399] tracking-tight mb-1 font-mono">
          {precision}
        </div>
        <div className="text-xs text-[#9CA3AF]">
          True Positives vs Total Matches
        </div>
      </div>

      {/* KPI 3: Recall */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Recall</span>
          <div className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#38BDF8] tracking-tight mb-1 font-mono">
          {recall}
        </div>
        <div className="text-xs text-[#9CA3AF]">
          Ground Truth Answer Key Accuracy
        </div>
      </div>

      {/* KPI 4: F1 & Execution Speed */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">F1 Score</span>
          <div className="p-2 rounded-lg bg-[#A855F7]/10 text-[#C084FC]">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#C084FC] tracking-tight mb-1 font-mono">
          {f1}
        </div>
        <div className="text-xs text-[#9CA3AF]">
          Harmonic Mean ({execTime} speed)
        </div>
      </div>
    </div>
  );
}
