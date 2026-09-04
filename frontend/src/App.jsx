import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, Bell, CircleAlert, Check, ChevronRight, FileCheck2, FileUp, FlaskConical, LayoutDashboard, Menu, Moon, Play, Radar, RefreshCw, ShieldCheck, Sparkles, Sun, X } from 'lucide-react';
import UploadModal from './components/UploadModal.jsx';
import AuditCertificateModal from './components/AuditCertificateModal.jsx';
import AlertsTab from './components/AlertsTab.jsx';
import ExceptionsTab from './components/ExceptionsTab.jsx';
import SecurityRadarTab from './components/SecurityRadarTab.jsx';
import AuditTable from './components/AuditTable.jsx';
import AskReconCopilot from './components/AskReconCopilot.jsx';

const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alert inbox', icon: Bell },
  { id: 'security', label: 'Security radar', icon: Radar },
  { id: 'audit', label: 'Audit trail', icon: FileCheck2 },
  { id: 'exceptions', label: 'Exceptions', icon: CircleAlert },
];

function Metric({ label, value, note, accent, icon: Icon }) {
  return (
    <div className="metric-tile">
      <div className="metric-top">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <div className={`metric-value ${accent || ''}`}>{value}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

function EmptyOverview({ onGenerate }) {
  return (
    <div className="empty-state">
      <div className="empty-orbit"><Sparkles size={30} /></div>
      <p className="eyebrow">Ready when you are</p>
      <h2>Bring your settlement data into focus.</h2>
      <p>Upload settlement and ledger files, or create a safe demo run to explore the reconciliation flow.</p>
      <button className="primary-btn" onClick={onGenerate}>
        <FlaskConical size={17} /> Create demo run
      </button>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('reconagent_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [auditFilter, setAuditFilter] = useState('all');
  const [mobileNav, setMobileNav] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [results, setResults] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [securityAnomalies, setSecurityAnomalies] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
      console.error(err);
    }
  };

  const handleNavigate = (targetTab, layerFilter = 'all') => {
    setActiveTab(targetTab);
    setAuditFilter(layerFilter);
    setMobileNav(false);
  };

  const handleResolveSuccess = (newResults, newAlerts, newSecurity, newAudit) => {
    if (newResults) setResults(newResults);
    if (newAlerts) setAlerts(newAlerts);
    if (newSecurity) setSecurityAnomalies(newSecurity);
    if (newAudit) setAuditLogs(newAudit);
    fetchResults();
    setStatusMessage({ type: 'info', text: 'Exception resolved and financial metrics updated persistent in real-time.' });
  };

  const runAction = async (kind, url, body, successText) => {
    setLoadingAction(kind);
    setStatusMessage({ type: 'info', text: 'Working through the reconciliation pipeline…' });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Action failed');
      if (data.results) {
        setResults(data.results);
        fetchResults();
      }
      setStatusMessage({ type: 'info', text: successText(data) });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const generate = () => runAction('generate', '/api/generate', null, data => `Demo dataset created: ${data.summary.settlementsCount} settlements and ${data.summary.internalLedgerCount} ledger entries. Run the pipeline when ready.`);
  const reconcile = (simulateFailure = false) => runAction(simulateFailure ? 'fail' : 'reconcile', '/api/reconcile', { simulateFailure }, data => simulateFailure ? 'Fallback path validated — the review queue is ready for human action.' : `Pipeline complete at ${data.results.metrics.matchRate}% match rate.`);

  const metrics = results?.metrics;
  const unresolved = results?.exceptions?.unresolvedSettlements?.length || 0;
  const activeLabel = nav.find(item => item.id === activeTab)?.label || 'Overview';
  const health = metrics ? Math.round(Number(metrics.matchRate) || 0) : 0;

  const tabContent = useMemo(() => {
    if (activeTab === 'alerts') return <AlertsTab alerts={alerts} onNavigate={handleNavigate} />;
    if (activeTab === 'security') return <SecurityRadarTab securityAnomalies={securityAnomalies} onNavigate={handleNavigate} />;
    if (activeTab === 'audit') return <AuditTable auditLogs={auditLogs} initialLayer={auditFilter} />;
    if (activeTab === 'exceptions') return <ExceptionsTab exceptions={results?.exceptions} onResolveSuccess={handleResolveSuccess} />;
    return null;
  }, [activeTab, alerts, securityAnomalies, auditLogs, auditFilter, results]);

  return (
    <div className="app-shell">
      <aside className={`side-rail ${mobileNav ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Activity size={19} /></div>
          <div><strong>recon</strong><span>control room</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <div className="rail-label">Workspace</div>
        <nav>
          {nav.map(item => {
            const Icon = item.icon;
            const count = item.id === 'alerts' ? alerts.length : item.id === 'exceptions' ? unresolved : item.id === 'security' ? securityAnomalies.length : null;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id, 'all')}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {count ? <b>{count}</b> : null}
                {activeTab === item.id && <ChevronRight className="nav-arrow" size={15} />}
              </button>
            );
          })}
        </nav>
        <div className="rail-footer">
          <div className="system-check">
            <span className="pulse-dot" />Engine online
            <div className="muted">All systems nominal</div>
          </div>
          <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" />}

      <main className="main-stage">
        <header className="topbar">
          <div className="topbar-title">
            <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
            <div>
              <p className="eyebrow">Operations / {activeLabel}</p>
              <h1>{activeTab === 'overview' ? 'Settlement intelligence' : activeLabel}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="date-stamp">LIVE · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="upload-btn" onClick={() => setIsUploadOpen(true)}>
              <FileUp size={17} /> Reconcile files
            </button>
          </div>
        </header>

        {statusMessage && (
          <div className={`status-banner ${statusMessage.type}`}>
            <span>{statusMessage.type === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)}><X size={15} /></button>
          </div>
        )}

        {activeTab === 'overview' ? (
          <>
            <section className="hero-panel">
              <div>
                <div className="hero-kicker"><span className="live-indicator" /> Reconciliation workspace</div>
                <h2>See what cleared.<br /><em>Act on what didn’t.</em></h2>
                <p>One calm view across settlements, ledgers, risk signals, and audit evidence.</p>
                <div className="hero-actions">
                  <button className="primary-btn" onClick={() => reconcile(false)} disabled={loadingAction === 'reconcile'}>
                    <Play size={16} /> {loadingAction === 'reconcile' ? 'Running…' : 'Run pipeline'}
                  </button>
                  <button className="secondary-btn" onClick={generate} disabled={loadingAction === 'generate'}>
                    <RefreshCw size={16} /> {loadingAction === 'generate' ? 'Creating…' : 'Generate demo'}
                  </button>
                  <button className="text-btn" onClick={() => reconcile(true)} disabled={loadingAction === 'fail'}>
                    Test fallback
                  </button>
                </div>
              </div>
              <div className="health-ring" style={{ '--progress': `${health * 3.6}deg` }}>
                <div>
                  <strong>{metrics ? `${health}%` : '—'}</strong>
                  <span>match rate</span>
                </div>
              </div>
            </section>

            <section className="metrics-row">
              <Metric label="Match rate" value={metrics ? `${metrics.matchRate}%` : '—'} note={metrics ? `${metrics.totalMatched} of ${metrics.totalSettlements} settlements` : 'No run yet'} accent="blue" icon={BarChart3} />
              <Metric label="Precision" value={metrics?.precision ?? '—'} note="True positives / total matches" icon={Check} />
              <Metric label="Recall" value={metrics?.recall ?? '—'} note="Ground truth accuracy ratio" icon={Radar} />
              <Metric label="F1 score" value={metrics?.f1Score ?? '—'} note={metrics ? `${metrics.executionTimeMs}ms pipeline latency` : 'Awaiting pipeline'} icon={Activity} />
            </section>

            {results ? (
              <>
                <section className="flow-card">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Resolution flow</p>
                      <h3>How records moved</h3>
                    </div>
                    <span className="tiny-tag">CLICK ANY LAYER TO VIEW RECORDS</span>
                  </div>
                  <div className="flow-steps">
                    {[
                      ['exact', '01', 'Exact match', 'Deterministic reference', 'audit', 'exact'],
                      ['fuzzy', '02', 'Fuzzy match', 'Similarity + date window', 'audit', 'fuzzy'],
                      ['ai', '03', 'AI escalation', 'Bounded model review', 'audit', 'ai'],
                      ['unresolvedSettlements', '04', 'Human queue', 'Needs your decision', 'exceptions', 'none']
                    ].map(([key, no, title, desc, targetTab, filter], i) => (
                      <div
                        className={`flow-step ${key === 'unresolvedSettlements' && unresolved ? 'danger' : ''}`}
                        key={key}
                        onClick={() => handleNavigate(targetTab, filter)}
                        style={{ cursor: 'pointer' }}
                        title={`Click to view ${title} records`}
                      >
                        <span className="flow-number">{no}</span>
                        <div>
                          <strong>{results.metrics.layerBreakdown?.[key] || 0}</strong>
                          <span>{title}</span>
                          <small>{desc}</small>
                        </div>
                        {i < 3 && <ArrowUpRight className="flow-arrow" size={17} />}
                      </div>
                    ))}
                  </div>
                </section>
                <AskReconCopilot />
              </>
            ) : (
              <EmptyOverview onGenerate={generate} />
            )}
          </>
        ) : (
          <section className="review-section">
            <div className="review-toolbar">
              <div>
                <p className="eyebrow">Live review workspace</p>
                <h2>{activeLabel}</h2>
              </div>
              {activeTab === 'audit' && <span className="tiny-tag">{auditLogs.length} RECORDS</span>}
            </div>
            <div className="panel-content">{tabContent}</div>
          </section>
        )}

        <footer>
          <span>Recon Control Room</span>
          <span>Protected operational workspace · API connected</span>
        </footer>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newResults, newAlerts) => {
          setResults(newResults);
          setAlerts(newAlerts || []);
          fetchResults();
          setStatusMessage({ type: 'info', text: `Reconciled ${newResults.metrics.totalSettlements} settlement records successfully.` });
        }}
      />
      <AuditCertificateModal isOpen={isCertOpen} onClose={() => setIsCertOpen(false)} results={results} />
      <button className="certificate-fab" onClick={() => setIsCertOpen(true)}>
        <ShieldCheck size={17} /> Audit certificate
      </button>
    </div>
  );
}
