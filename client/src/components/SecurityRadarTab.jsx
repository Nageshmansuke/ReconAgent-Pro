import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SecurityRadarTab({ securityAnomalies }) {
  if (!securityAnomalies || securityAnomalies.length === 0) {
    return (
      <div className="recon-card p-8 text-center text-[var(--text-secondary)] font-medium">
        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
        Ghost payout & UTR recycling detector active. No security anomalies or fraud threats flagged!
      </div>
    );
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
    }
  };

  return (
    <div className="recon-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" /> Ghost Settlement & Fraud Attack Radar
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Real-time threat detection identifying phantom payouts, UTR replay attacks, and abnormal volume spikes.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          {securityAnomalies.length} Security Threat(s)
        </span>
      </div>

      <div className="space-y-4">
        {securityAnomalies.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[var(--bg-input)] border border-rose-500/30"
          >
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">{item.type}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getSeverityBadge(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{item.details}</p>

            {item.affectedRecords && item.affectedRecords.length > 0 && (
              <div className="mb-3 p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-dim)]">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">Flagged Records:</span>
                <div className="flex flex-wrap gap-2">
                  {item.affectedRecords.map((rec, rIdx) => (
                    <span key={rIdx} className="px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-dim)] text-[11px] font-mono text-cyan-500">
                      {rec.settlement_id || rec.utr} (₹{rec.amount?.toLocaleString('en-IN')})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>Mitigation Directive:</strong> {item.mitigation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
