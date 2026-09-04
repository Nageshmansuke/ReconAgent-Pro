import React from 'react';
import { ShieldCheck, Upload, Play, AlertOctagon, RefreshCw } from 'lucide-react';

export default function Header({
  onOpenUpload,
  onGenerateDemo,
  onRunPipeline,
  onSimulateFailure,
  loadingAction
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#1E2532] mb-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#F5C453] via-[#D99B26] to-[#F5C453] p-0.5 shadow-lg shadow-[#F5C453]/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0A0C10] rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#F5C453]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">ReconAgent Pro</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Live Operational
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF]">Track 04: Multi-Source Real-Time AI Finance Reconciliation Controller</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <button
          onClick={onOpenUpload}
          className="btn btn-gold"
        >
          <Upload className="w-4 h-4" />
          📁 Reconcile Real Files
        </button>

        <button
          onClick={onGenerateDemo}
          disabled={loadingAction === 'generate'}
          className="btn btn-outline"
        >
          <RefreshCw className={`w-4 h-4 ${loadingAction === 'generate' ? 'animate-spin' : ''}`} />
          ⚡ Demo Data
        </button>

        <button
          onClick={onRunPipeline}
          disabled={loadingAction === 'reconcile'}
          className="btn btn-cyan"
        >
          <Play className={`w-4 h-4 ${loadingAction === 'reconcile' ? 'animate-spin' : ''}`} />
          ▶ Run Pipeline
        </button>

        <button
          onClick={onSimulateFailure}
          disabled={loadingAction === 'fail'}
          className="btn btn-danger-outline"
          title="Simulate live AI timeout / malformed response to test failure recovery"
        >
          <AlertOctagon className="w-4 h-4" />
          ⚠ Test AI Failure Fallback
        </button>
      </div>
    </header>
  );
}
