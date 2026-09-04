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
    <div className="grid-kpi">
      {/* KPI 1: Match Rate */}
      <div className="recon-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Match Rate</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-amber-500 font-mono tracking-tight mb-1">
            {matchRate}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-medium">
            {totalMatched} / {totalSettlements} settlements matched
          </div>
        </div>
      </div>

      {/* KPI 2: Precision */}
      <div className="recon-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Precision</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-emerald-500 font-mono tracking-tight mb-1">
            {precision}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-medium">
            True Positives vs Total Matches
          </div>
        </div>
      </div>

      {/* KPI 3: Recall */}
      <div className="recon-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Recall</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-cyan-500 font-mono tracking-tight mb-1">
            {recall}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-medium">
            Ground Truth Answer Key Accuracy
          </div>
        </div>
      </div>

      {/* KPI 4: F1 Score */}
      <div className="recon-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">F1 Score</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-indigo-500 font-mono tracking-tight mb-1">
            {f1}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-medium">
            Harmonic Mean ({execTime} speed)
          </div>
        </div>
      </div>
    </div>
  );
}
