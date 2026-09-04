import React from 'react';

export default function KpiGrid({ metrics }) {
  const matchRate = metrics?.matchRate !== undefined ? `${metrics.matchRate}%` : '—';
  const precision = metrics?.precision !== undefined ? metrics.precision : '—';
  const recall = metrics?.recall !== undefined ? metrics.recall : '—';
  const f1 = metrics?.f1Score !== undefined ? metrics.f1Score : '—';
  const totalMatched = metrics?.totalMatched || 0;
  const totalSettlements = metrics?.totalSettlements || 0;
  const execTime = metrics?.executionTimeMs !== undefined ? `${metrics.executionTimeMs}ms` : '—';

  return (
    <div className="metrics-grid">
      {/* KPI 1: Match Rate (HERO METRIC - Single Accent Color) */}
      <div className="metric-card">
        <div className="metric-label">Match Rate</div>
        <div className="metric-hero-value text-[var(--accent-blue)]">
          {matchRate}
        </div>
        <div className="metric-caption">
          {totalMatched} of {totalSettlements} settlements matched
        </div>
      </div>

      {/* KPI 2: Precision (Neutral Primary Text) */}
      <div className="metric-card">
        <div className="metric-label">Precision</div>
        <div className="metric-hero-value text-[var(--text-primary)]">
          {precision}
        </div>
        <div className="metric-caption">
          True positives vs total matches
        </div>
      </div>

      {/* KPI 3: Recall (Neutral Primary Text) */}
      <div className="metric-card">
        <div className="metric-label">Recall</div>
        <div className="metric-hero-value text-[var(--text-primary)]">
          {recall}
        </div>
        <div className="metric-caption">
          Ground truth accuracy ratio
        </div>
      </div>

      {/* KPI 4: F1 Score (Neutral Primary Text) */}
      <div className="metric-card">
        <div className="metric-label">F1 Score</div>
        <div className="metric-hero-value text-[var(--text-primary)]">
          {f1}
        </div>
        <div className="metric-caption">
          Harmonic mean ({execTime} latency)
        </div>
      </div>
    </div>
  );
}
