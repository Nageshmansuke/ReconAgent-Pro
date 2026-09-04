import React from 'react';

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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
      {/* Brand & Quiet Typographic Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          ReconAgent Pro
        </h1>
        <div className="h-4 w-[1px] bg-[var(--border-subtle)]"></div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-normal">
          <span className="status-dot status-dot-success"></span>
          <span>Operational</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="btn-ghost text-xs"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        </button>

        <button
          onClick={onOpenUpload}
          className="btn-ghost text-xs"
        >
          Reconcile Files
        </button>

        <button
          onClick={onGenerateDemo}
          disabled={loadingAction === 'generate'}
          className="btn-ghost text-xs"
        >
          {loadingAction === 'generate' ? 'Generating...' : 'Demo Data'}
        </button>

        <button
          onClick={onSimulateFailure}
          disabled={loadingAction === 'fail'}
          className="btn-ghost text-xs text-[var(--color-danger)] border-[var(--border-subtle)]"
          title="Simulate live AI timeout / malformed response to test failure recovery"
        >
          Test AI Fallback
        </button>

        {/* ONE Single Filled Accent CTA Button */}
        <button
          onClick={onRunPipeline}
          disabled={loadingAction === 'reconcile'}
          className="btn-primary-accent text-xs"
        >
          {loadingAction === 'reconcile' ? 'Running Pipeline...' : 'Run Pipeline'}
        </button>
      </div>
    </header>
  );
}
