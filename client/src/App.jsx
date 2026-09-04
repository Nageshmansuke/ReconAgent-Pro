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
import { Bell, FileText, AlertTriangle, ShieldAlert, Award } from 'lucide-react';

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
    setStatusMessage({ type: 'info', text: 'Generating synthetic dataset with realistic noise...' });
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'info',
          text: `Generated synthetic dataset: ${data.summary.settlementsCount} settlements, ${data.summary.internalLedgerCount} ledger orders. Click "Run Pipeline" to process.`
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
        ? 'Running pipeline with forced AI failure fallback simulation...'
        : 'Running multi-layer reconciliation pipeline...'
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
            text: 'Failure recovery demonstrated! AI errors caught cleanly and degraded to "unresolved — flagged for human review" without crashing.'
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `Reconciliation complete! Match rate: ${data.results.metrics.matchRate}%`
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
      text: `Successfully reconciled real files! Processed ${newResults.metrics.totalSettlements} settlement records.`
    });
  };

  const unresolvedCount = results?.exceptions?.unresolvedSettlements?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen flex flex-col">
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
        <div className={`p-4 rounded-xl mb-6 font-medium text-xs sm:text-sm border flex justify-between items-center transition-all ${
          statusMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-sm opacity-60 hover:opacity-100 font-bold ml-2">&times;</button>
        </div>
      )}

      <main className="flex-1">
        <KpiGrid metrics={results?.metrics} />
        <LayerBreakdown layerBreakdown={results?.metrics?.layerBreakdown} />

        {/* Feature 4: Natural Language Ask Recon Finance Copilot */}
        <AskReconCopilot />

        {/* Tab Controls & Feature 5 Certificate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 border-b border-[var(--border-dim)] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'alerts'
                  ? 'bg-[var(--bg-card)] text-amber-500 border border-[var(--border-bright)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              Alerts Center ({alerts.length})
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'security'
                  ? 'bg-[var(--bg-card)] text-rose-500 border border-[var(--border-bright)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Security Radar ({securityAnomalies.length})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'audit'
                  ? 'bg-[var(--bg-card)] text-cyan-500 border border-[var(--border-bright)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-500" />
              Audit Trail ({auditLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('exceptions')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'exceptions'
                  ? 'bg-[var(--bg-card)] text-rose-400 border border-[var(--border-bright)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Exceptions ({unresolvedCount})
            </button>
          </div>

          {/* Feature 5: Auditor & CA Sign-Off Certificate Button */}
          <button
            onClick={() => setIsCertOpen(true)}
            className="btn btn-indigo text-xs py-2 px-4 shadow-lg shrink-0"
          >
            <Award className="w-4 h-4 text-amber-400" />
            📜 CA Audit Certificate
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
        {activeTab === 'security' && <SecurityRadarTab securityAnomalies={securityAnomalies} />}
        {activeTab === 'audit' && <AuditTable auditLogs={auditLogs} />}
        {activeTab === 'exceptions' && <ExceptionsTab exceptions={results?.exceptions} />}
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

      <footer className="mt-12 pt-6 border-t border-[var(--border-dim)] text-center text-xs text-[var(--text-tertiary)]">
        <p>ReconAgent Pro — Multi-Source Real-Time AI Finance Controller | Built for Razorpay AI Buildathon 2026</p>
      </footer>
    </div>
  );
}
