import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import KpiGrid from './components/KpiGrid.jsx';
import LayerBreakdown from './components/LayerBreakdown.jsx';
import UploadModal from './components/UploadModal.jsx';
import AuditTable from './components/AuditTable.jsx';
import AlertsTab from './components/AlertsTab.jsx';
import ExceptionsTab from './components/ExceptionsTab.jsx';
import { Bell, FileText, AlertTriangle } from 'lucide-react';

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [loadingAction, setLoadingAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const [results, setResults] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

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
      }
    } catch (err) {
      console.error('Error fetching initial results:', err);
    }
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
          text: `Generated synthetic dataset: ${data.summary.settlementsCount} settlements, ${data.summary.internalLedgerCount} ledger orders. Now click "Run Pipeline".`
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
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen flex flex-col">
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onGenerateDemo={handleGenerateDemo}
        onRunPipeline={() => handleRunPipeline(false)}
        onSimulateFailure={() => handleRunPipeline(true)}
        loadingAction={loadingAction}
      />

      {statusMessage && (
        <div className={`p-4 rounded-xl mb-6 font-medium text-sm border flex justify-between items-center ${
          statusMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-[#F5C453]/10 border-[#F5C453]/30 text-[#F5C453]'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <main className="flex-1">
        <KpiGrid metrics={results?.metrics} />
        <LayerBreakdown layerBreakdown={results?.metrics?.layerBreakdown} />

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mb-4 border-b border-[#1E2532] pb-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`btn-tab flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'alerts'
                ? 'bg-[#12161F] text-[#F5C453] border border-[#1E2532]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-[#F5C453]" />
            Alerts Center ({alerts.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`btn-tab flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-[#12161F] text-[#38BDF8] border border-[#1E2532]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-[#38BDF8]" />
            Audit Trail ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('exceptions')}
            className={`btn-tab flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'exceptions'
                ? 'bg-[#12161F] text-[#F43F5E] border border-[#1E2532]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#F43F5E]" />
            Honest Exceptions ({unresolvedCount})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
        {activeTab === 'audit' && <AuditTable auditLogs={auditLogs} />}
        {activeTab === 'exceptions' && <ExceptionsTab exceptions={results?.exceptions} />}
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleRealUploadSuccess}
      />

      <footer className="mt-12 pt-6 border-t border-[#1E2532] text-center text-xs text-[#9CA3AF]">
        <p>ReconAgent Pro — Deterministic-First AI Finance Controller | Built for Razorpay AI Buildathon 2026</p>
      </footer>
    </div>
  );
}
