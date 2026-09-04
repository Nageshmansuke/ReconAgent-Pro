document.addEventListener('DOMContentLoaded', () => {
  const btnGenerate = document.getElementById('btn-generate');
  const btnReconcile = document.getElementById('btn-reconcile');
  const btnSimulateFail = document.getElementById('btn-simulate-fail');

  const statusBanner = document.getElementById('status-banner');
  const filterLayer = document.getElementById('filter-layer');

  const kpiMatchRate = document.getElementById('kpi-match-rate');
  const kpiMatchedCount = document.getElementById('kpi-matched-count');
  const kpiPrecision = document.getElementById('kpi-precision');
  const kpiRecall = document.getElementById('kpi-recall');
  const kpiF1 = document.getElementById('kpi-f1');

  const countExact = document.getElementById('count-exact');
  const countFuzzy = document.getElementById('count-fuzzy');
  const countAi = document.getElementById('count-ai');
  const countUnresolved = document.getElementById('count-unresolved');

  const auditTableBody = document.getElementById('audit-table-body');
  const exceptionsTableBody = document.getElementById('exceptions-table-body');

  const auditTotalCount = document.getElementById('audit-total-count');
  const exceptionsTotalCount = document.getElementById('exceptions-total-count');

  let currentResults = null;
  let currentAuditLog = [];

  // Tab switching logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Load existing results on startup
  fetchResults();

  // Event Listeners
  btnGenerate.addEventListener('click', async () => {
    setLoading(btnGenerate, true, 'Generating...');
    showBanner('Generating synthetic dataset with realistic noise...', 'info');
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showBanner(`Generated dataset: ${data.summary.settlementsCount} settlements, ${data.summary.internalLedgerCount} ledger records. Now click "Run Reconciliation".`, 'info');
      } else {
        showBanner(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showBanner(`Network error: ${err.message}`, 'error');
    } finally {
      setLoading(btnGenerate, false, '⚡ Generate Data');
    }
  });

  btnReconcile.addEventListener('click', () => handleReconciliation(false));
  btnSimulateFail.addEventListener('click', () => handleReconciliation(true));

  filterLayer.addEventListener('change', renderAuditTable);

  async function handleReconciliation(simulateFailure = false) {
    const btn = simulateFailure ? btnSimulateFail : btnReconcile;
    const label = simulateFailure ? '⚠ Testing Fallback...' : 'Running...';
    const origText = simulateFailure ? '⚠ Test AI Failure Fallback' : '▶ Run Reconciliation';

    setLoading(btn, true, label);
    showBanner(simulateFailure ? 'Running pipeline with forced AI failure fallback simulation...' : 'Running multi-layer reconciliation pipeline...', 'info');

    try {
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateFailure })
      });
      const data = await res.json();
      if (data.success) {
        currentResults = data.results;
        fetchResults(); // Refresh view
        if (simulateFailure) {
          showBanner('Failure recovery demonstrated! AI errors caught cleanly and degraded to "unresolved — flagged for human review" without crashing.', 'info');
        } else {
          showBanner(`Reconciliation complete! Match rate: ${data.results.metrics.matchRate}%`, 'info');
        }
      } else {
        showBanner(`Reconciliation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      showBanner(`Network error: ${err.message}`, 'error');
    } finally {
      setLoading(btn, false, origText);
    }
  }

  async function fetchResults() {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if (data.hasData) {
        currentResults = data.results;
        currentAuditLog = data.auditLog;
        renderDashboard();
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  }

  function renderDashboard() {
    if (!currentResults) return;

    const m = currentResults.metrics;

    // KPI Cards
    kpiMatchRate.textContent = `${m.matchRate}%`;
    kpiMatchedCount.textContent = `${m.totalMatched} / ${m.totalSettlements} settlements matched`;
    kpiPrecision.textContent = m.precision;
    kpiRecall.textContent = m.recall;
    kpiF1.textContent = m.f1Score;

    // Layer breakdown
    countExact.textContent = m.layerBreakdown.exact;
    countFuzzy.textContent = m.layerBreakdown.fuzzy;
    countAi.textContent = m.layerBreakdown.ai;
    countUnresolved.textContent = m.layerBreakdown.unresolvedSettlements;

    auditTotalCount.textContent = currentAuditLog.length;

    const exceptionsList = currentResults.exceptions?.unresolvedSettlements || [];
    exceptionsTotalCount.textContent = exceptionsList.length;

    renderAuditTable();
    renderExceptionsTable(exceptionsList);
  }

  function renderAuditTable() {
    if (!currentAuditLog || currentAuditLog.length === 0) {
      auditTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No audit logs available.</td></tr>';
      return;
    }

    const selectedLayer = filterLayer.value;
    const filteredLog = currentAuditLog.filter(item => {
      if (selectedLayer === 'all') return true;
      return item.resolving_layer === selectedLayer;
    });

    if (filteredLog.length === 0) {
      auditTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No records found for layer "${selectedLayer}".</td></tr>`;
      return;
    }

    auditTableBody.innerHTML = filteredLog.map(item => {
      const badgeClass = getBadgeClass(item.resolving_layer);
      const layerLabel = item.resolving_layer === 'none' ? 'UNRESOLVED' : item.resolving_layer.toUpperCase();
      const confidenceStr = item.confidence ? `${Math.round(item.confidence * 100)}%` : '--';

      return `
        <tr>
          <td class="font-mono">${escapeHtml(item.settlement_id)}</td>
          <td class="font-mono">${escapeHtml(item.payment_id || '--')}</td>
          <td class="font-mono">${escapeHtml(item.utr || '--')}</td>
          <td>₹${item.amount?.toLocaleString('en-IN') || '0'}</td>
          <td><span class="badge ${badgeClass}">${layerLabel}</span></td>
          <td>${confidenceStr}</td>
          <td>${escapeHtml(item.reason)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderExceptionsTable(exceptions) {
    if (!exceptions || exceptions.length === 0) {
      exceptionsTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No unresolved exceptions — 100% matched!</td></tr>';
      return;
    }

    exceptionsTableBody.innerHTML = exceptions.map(ex => {
      const dateStr = ex.settlement_date ? new Date(ex.settlement_date).toLocaleDateString('en-IN') : '--';
      return `
        <tr>
          <td class="font-mono">${escapeHtml(ex.settlement_id)}</td>
          <td class="font-mono">${escapeHtml(ex.payment_id || '--')}</td>
          <td>₹${ex.amount?.toLocaleString('en-IN') || '0'}</td>
          <td>${dateStr}</td>
          <td>${escapeHtml(ex.customer_name || 'N/A')}</td>
          <td><span class="badge badge-unresolved">FLAGGED</span> ${escapeHtml(ex.unresolved_reason || 'Unresolved — flagged for human review')}</td>
        </tr>
      `;
    }).join('');
  }

  function getBadgeClass(layer) {
    switch (layer) {
      case 'exact': return 'badge-exact';
      case 'fuzzy': return 'badge-fuzzy';
      case 'ai': return 'badge-ai';
      default: return 'badge-unresolved';
    }
  }

  function showBanner(message, type = 'info') {
    statusBanner.className = `status-banner ${type}`;
    statusBanner.textContent = message;
  }

  function setLoading(btn, isLoading, text) {
    btn.disabled = isLoading;
    btn.textContent = text;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
