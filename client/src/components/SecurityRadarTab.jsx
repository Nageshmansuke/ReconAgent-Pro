import React from 'react';
import { ShieldAlert, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export default function SecurityRadarTab({ securityAnomalies }) {
  if (!securityAnomalies || securityAnomalies.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[#9CA3AF]">
        <CheckCircle2 className="w-10 h-10 mx-auto text-[#10B981] mb-2 opacity-60" />
        Security Radar Clean — Zero ghost settlements or UTR reuse attacks detected!
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Ghost Settlement & Fraud Detector</h3>
          <p className="text-xs text-[#9CA3AF]">Monitors bank payouts for unlinked money, multi-account UTR reuse, and volume spikes.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {securityAnomalies.map((sec, idx) => {
          const isCritical = sec.severity === 'critical';

          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border ${
                isCritical
                  ? 'bg-rose-500/5 border-rose-500/30'
                  : 'bg-amber-500/5 border-amber-500/30'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                  <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                </div>
                <span className={`badge-pill ${isCritical ? 'badge-unresolved' : 'badge-fuzzy'}`}>
                  {sec.severity.toUpperCase()} THREAT
                </span>
              </div>

              <p className="text-xs text-[#D1D5DB] mb-3">{sec.description}</p>

              {sec.records && sec.records.length > 0 && (
                <div className="bg-[#0A0C10] p-3 rounded-lg border border-[#1E2532]">
                  <span className="text-[11px] font-semibold text-[#9CA3AF] block mb-2">Affected Flagged Records:</span>
                  <div className="overflow-x-auto">
                    <pre className="text-xs font-mono text-[#38BDF8]">
                      {JSON.stringify(sec.records, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
