import React from 'react';

export default function ExceptionsTab({ exceptions }) {
  const unresolved = exceptions?.unresolvedSettlements || [];

  if (unresolved.length === 0) {
    return (
      <div className="terminal-card p-6 text-center text-xs text-[var(--text-secondary)]">
        ✓ Zero unresolved exceptions. 100% of settlement records matched.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {unresolved.map((item, idx) => (
        <div
          key={idx}
          className="p-4 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="status-dot status-dot-danger"></span>
              <span className="font-mono-numbers text-xs font-semibold text-[var(--text-primary)]">{item.settlement_id}</span>
              <span className="text-[11px] font-mono text-[var(--color-danger)]">UNRESOLVED</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Amount: <strong className="font-mono-numbers text-[var(--text-primary)]">₹{item.amount?.toLocaleString('en-IN')}</strong> | UTR: <span className="font-mono-numbers text-[var(--text-secondary)]">{item.utr || 'N/A'}</span>
            </p>
            <p className="text-xs text-[var(--color-danger)]">{item.reason}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="btn-ghost text-xs py-1 px-3">
              Force Match
            </button>
            <button className="btn-ghost text-xs py-1 px-3 text-[var(--color-danger)]">
              Write-Off
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
