import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AlertsTab({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[#9CA3AF]">
        <ShieldAlert className="w-10 h-10 mx-auto text-[#10B981] mb-2 opacity-60" />
        No active risk alerts generated yet. Run reconciliation to analyze data.
      </div>
    );
  }

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-[#F43F5E]" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-[#F5C453]" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      default: return <Info className="w-5 h-5 text-[#38BDF8]" />;
    }
  };

  const getBorderClass = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-l-[#F43F5E] bg-[#F43F5E]/5';
      case 'warning': return 'border-l-4 border-l-[#F5C453] bg-[#F5C453]/5';
      case 'success': return 'border-l-4 border-l-[#10B981] bg-[#10B981]/5';
      default: return 'border-l-4 border-l-[#38BDF8] bg-[#38BDF8]/5';
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Financial Risk & Anomaly Alerts</h3>
        <p className="text-xs text-[#9CA3AF]">Automated alerts generated on high-value discrepancies, fee rate anomalies, and duplicate pings.</p>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert, idx) => {
          const timeStr = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString('en-IN') : '';

          return (
            <div key={idx} className={`p-4 rounded-xl border border-[#1E2532] ${getBorderClass(alert.severity)} transition-all`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <span className="text-xs font-mono text-[#9CA3AF]">{timeStr}</span>
                  </div>
                  <p className="text-xs text-[#D1D5DB]">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
