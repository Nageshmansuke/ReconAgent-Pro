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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-dim)] mb-6">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-[var(--bg-card)] rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-indigo-500" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">ReconAgent Pro</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operational
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Track 04: Multi-Source Real-Time AI Finance Reconciliation Controller</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onToggleTheme}
          className="btn-action btn-outline-style"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenUpload}
          className="btn-action btn-emerald-gradient"
        >
          <Upload className="w-4 h-4" />
          <span>📁 Reconcile Real Files</span>
        </button>

        <button
          onClick={onGenerateDemo}
          disabled={loadingAction === 'generate'}
          className="btn-action btn-outline-style"
        >
          <RefreshCw className={`w-4 h-4 ${loadingAction === 'generate' ? 'animate-spin' : ''}`} />
          <span>⚡ Demo Data</span>
        </button>

        <button
          onClick={onRunPipeline}
          disabled={loadingAction === 'reconcile'}
          className="btn-action btn-indigo-gradient"
        >
          <Play className={`w-4 h-4 ${loadingAction === 'reconcile' ? 'animate-spin' : ''}`} />
          <span>▶ Run Pipeline</span>
        </button>

        <button
          onClick={onSimulateFailure}
          disabled={loadingAction === 'fail'}
          className="btn-action btn-rose-warning"
          title="Simulate live AI timeout / malformed response to test failure recovery"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>⚠ Test AI Fallback</span>
        </button>
      </div>
    </header>
  );
}
