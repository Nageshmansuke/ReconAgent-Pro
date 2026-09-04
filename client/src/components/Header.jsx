import React from 'react';
import { ShieldCheck, Upload, Play, AlertOctagon, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({
  onOpenUpload,
  onGenerateDemo,
  onRunPipeline,
  onSimulateFailure,
  loadingAction,
  theme,
  onToggleTheme
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[var(--border-dim)] mb-6 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#06B6D4] to-[#10B981] p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[var(--bg-card)] rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[var(--accent-primary)]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">ReconAgent Pro</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] border border-[var(--accent-emerald)]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald)] pulse-dot"></span>
              Live Operational
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Track 04: Multi-Source Real-Time AI Finance Reconciliation Controller</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="btn btn-outline px-3 py-2 text-xs"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenUpload}
          className="btn btn-emerald"
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
          className="btn btn-indigo"
        >
          <Play className={`w-4 h-4 ${loadingAction === 'reconcile' ? 'animate-spin' : ''}`} />
          ▶ Run Pipeline
        </button>

        <button
          onClick={onSimulateFailure}
          disabled={loadingAction === 'fail'}
          className="btn btn-danger"
          title="Simulate live AI timeout / malformed response to test failure recovery"
        >
          <AlertOctagon className="w-4 h-4" />
          ⚠ Test AI Fallback
        </button>
      </div>
    </header>
  );
}
