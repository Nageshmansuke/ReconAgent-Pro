import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function AlertsTab({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[var(--text-secondary)]">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
        No financial alerts or anomalies detected. Your settlement data is healthy!
      </div>
    );
  }

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'HIGH': return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default: return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  const getAlertBadge = (severity) => {
    switch (severity) {
      case 'HIGH': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Automated Risk & Reconciliation Alerts</h3>
          <p className="text-xs text-[var(--text-secondary)]">Proactive alerts triggered for fee overcharges, volume spikes, and missing payouts.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          {alerts.length} Active Alerts
        </span>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--border-bright)] transition-all flex items-start gap-3"
          >
            {getAlertIcon(alert.severity)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">{alert.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getAlertBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] ml-auto font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-2">{alert.message}</p>
              <div className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                💡 <strong>Suggested CFO Action:</strong> {alert.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
