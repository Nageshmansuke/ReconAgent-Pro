import React from 'react';

export default function SecurityRadarTab({ securityAnomalies }) {
  if (!securityAnomalies || securityAnomalies.length === 0) {
    return (
      <div className="terminal-card p-6 text-center text-xs text-[var(--text-secondary)]">
        ✓ Ghost payout & UTR recycling detector active. No security anomalies flagged.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {securityAnomalies.map((item, idx) => (
        <div
          key={idx}
          className="p-4 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="status-dot status-dot-danger"></span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">{item.type}</span>
              <span className="text-[11px] font-mono text-[var(--color-danger)] uppercase">{item.severity}</span>
            </div>
            <span className="text-xs font-mono-numbers text-[var(--text-tertiary)]">{new Date(item.timestamp).toLocaleTimeString()}</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.details}</p>

          {item.affectedRecords && item.affectedRecords.length > 0 && (
            <div className="p-2.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] block mb-1">Flagged Records:</span>
              <div className="flex flex-wrap gap-2">
                {item.affectedRecords.map((rec, rIdx) => (
                  <span key={rIdx} className="text-xs font-mono-numbers text-[var(--text-primary)]">
                    {rec.settlement_id || rec.utr} (₹{rec.amount?.toLocaleString('en-IN')})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-[var(--color-danger)] pt-1 border-t border-[var(--border-subtle)]">
            <strong>Mitigation:</strong> {item.mitigation}
          </div>
        </div>
      ))}
    </div>
  );
}
