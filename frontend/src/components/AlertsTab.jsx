import React from 'react';

export default function AlertsTab({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="terminal-card p-6 text-center text-xs text-[var(--text-secondary)]">
        ✓ No financial alerts or anomalies detected. Settlement data verified.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="p-4 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`status-dot ${
                alert.severity === 'HIGH' ? 'status-dot-danger' :
                alert.severity === 'MEDIUM' ? 'status-dot-caution' : 'status-dot-success'
              }`}></span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">{alert.title}</span>
            </div>
            <span className="text-xs font-mono-numbers text-[var(--text-tertiary)]">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{alert.message}</p>
          <div className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)] mt-1">
            <strong>Recommended Action:</strong> {alert.action}
          </div>
        </div>
      ))}
    </div>
  );
}
