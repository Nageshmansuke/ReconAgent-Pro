import React from 'react';
import { AlertOctagon, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ExceptionsTab({ exceptions }) {
  const unresolved = exceptions?.unresolvedSettlements || [];

  if (unresolved.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[var(--text-secondary)]">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
        Zero unresolved exceptions! 100% of your gateway settlements matched successfully.
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Honest Unresolved Exceptions Queue</h3>
          <p className="text-xs text-[var(--text-secondary)]">Records that failed L1, L2, and L3 verification — flagged for human CFO review instead of hallucinating false matches.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          {unresolved.length} Unresolved
        </span>
      </div>

      <div className="space-y-4">
        {unresolved.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--bg-card)] border border-rose-500/30 hover:border-rose-500/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-mono text-[var(--text-primary)]">{item.settlement_id}</span>
                  <span className="badge-chip badge-unresolved">UNRESOLVED</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">
                  Amount: <strong className="text-[var(--text-primary)]">₹{item.amount?.toLocaleString('en-IN')}</strong> | UTR: <span className="font-mono text-cyan-500">{item.utr || 'N/A'}</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-rose-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{item.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="btn btn-outline text-xs py-1.5 px-3 w-full md:w-auto">
                Override & Force Match
              </button>
              <button className="btn btn-danger text-xs py-1.5 px-3 w-full md:w-auto">
                Write-Off Exception
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
