import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import KpiGrid from './components/KpiGrid.jsx';
import LayerBreakdown from './components/LayerBreakdown.jsx';
import UploadModal from './components/UploadModal.jsx';
import AuditTable from './components/AuditTable.jsx';
import AlertsTab from './components/AlertsTab.jsx';
import ExceptionsTab from './components/ExceptionsTab.jsx';
import SecurityRadarTab from './components/SecurityRadarTab.jsx';
import AskReconCopilot from './components/AskReconCopilot.jsx';
import AuditCertificateModal from './components/AuditCertificateModal.jsx';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('reconagent_theme') || 'dark');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'security' | 'audit' | 'exceptions'
  const [loadingAction, setLoadingAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const [results, setResults] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [securityAnomalies, setSecurityAnomalies] = useState([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('reconagent_theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if (data.hasData) {
        setResults(data.results);
        setAuditLogs(data.auditLog || []);
        setAlerts(data.alerts || []);
        setSecurityAnomalies(data.securityAnomalies || []);
      }
    } catch (err) {
      console.error('Error fetching initial results:', err);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleGenerateDemo = async () => {
    setLoadingAction('generate');
    setStatusMessage({ type: 'info', text: 'Generating synthetic dataset...' });
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'info',
          text: `Dataset generated (${data.summary.settlementsCount} settlements, ${data.summary.internalLedgerCount} ledger entries). Click "Run Pipeline".`
        });
      } else {
        setStatusMessage({ type: 'error', text: `Error: ${data.error}` });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunPipeline = async (simulateFailure = false) => {
    setLoadingAction(simulateFailure ? 'fail' : 'reconcile');
    setStatusMessage({
      type: 'info',
      text: simulateFailure
        ? 'Executing pipeline with forced AI failure fallback...'
        : 'Executing multi-layer reconciliation pipeline...'
    });

    try {
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateFailure })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setAuditLogs(data.results.matched ? [...data.results.matched, ...(data.results.exceptions?.unresolvedSettlements || [])] : []);
        setAlerts(data.alerts || []);
        setSecurityAnomalies(data.securityAnomalies || []);

        if (simulateFailure) {
          setStatusMessage({
            type: 'info',
            text: 'AI failure recovered cleanly to human review queue without pipeline interruption.'
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `Pipeline execution complete. Match rate: ${data.results.metrics.matchRate}% (Precision: ${data.results.metrics.precision}, Recall: ${data.results.metrics.recall})`
          });
        }
      } else {
        setStatusMessage({ type: 'error', text: `Pipeline error: ${data.error}` });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRealUploadSuccess = (newResults, newAlerts) => {
    setResults(newResults);
    setAlerts(newAlerts || []);
    fetchResults();
    setStatusMessage({
      type: 'info',
      text: `Reconciled ${newResults.metrics.totalSettlements} operational settlement records successfully.`
    });
  };

  const unresolvedCount = results?.exceptions?.unresolvedSettlements?.length || 0;

  return (
    <div className="terminal-layout">
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onGenerateDemo={handleGenerateDemo}
        onRunPipeline={() => handleRunPipeline(false)}
        onSimulateFailure={() => handleRunPipeline(true)}
        loadingAction={loadingAction}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {statusMessage && (
        <div className={`px-4 py-2.5 rounded text-xs border flex items-center justify-between transition-opacity ${
          statusMessage.type === 'error'
            ? 'bg-[var(--bg-surface-elevated)] border-[var(--color-danger)] text-[var(--color-danger)]'
            : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-mono ml-4">&times;</button>
        </div>
      )}

      <main className="flex flex-col gap-8">
        <KpiGrid metrics={results?.metrics} />
        <LayerBreakdown layerBreakdown={results?.metrics?.layerBreakdown} />
        <AskReconCopilot />

        {/* Quiet Underline Tabs Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)]">
          <div className="terminal-tabs-bar">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`tab-item ${activeTab === 'alerts' ? 'active' : ''}`}
            >
              Alerts <span className="font-mono-numbers text-xs font-normal">({alerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`tab-item ${activeTab === 'security' ? 'active' : ''}`}
            >
              Security Radar <span className="font-mono-numbers text-xs font-normal">({securityAnomalies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`tab-item ${activeTab === 'audit' ? 'active' : ''}`}
            >
              Audit Trail <span className="font-mono-numbers text-xs font-normal">({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('exceptions')}
              className={`tab-item ${activeTab === 'exceptions' ? 'active' : ''}`}
            >
              Exceptions <span className="font-mono-numbers text-xs font-normal">({unresolvedCount})</span>
            </button>
          </div>

          <button
            onClick={() => setIsCertOpen(true)}
            className="btn-ghost text-xs self-end sm:self-auto mb-2 sm:mb-0"
          >
            Audit Certificate
          </button>
        </div>

        {/* Active Tab Panel */}
        <div>
          {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
          {activeTab === 'security' && <SecurityRadarTab securityAnomalies={securityAnomalies} />}
          {activeTab === 'audit' && <AuditTable auditLogs={auditLogs} />}
          {activeTab === 'exceptions' && <ExceptionsTab exceptions={results?.exceptions} />}
        </div>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleRealUploadSuccess}
      />

      <AuditCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        results={results}
      />

      <footer className="pt-6 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-tertiary)]">
        ReconAgent Pro — Multi-Source AI Finance Reconciliation Controller | Razorpay Buildathon 2026
      </footer>
    </div>
  );
}
