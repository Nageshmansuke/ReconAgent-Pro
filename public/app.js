document.addEventListener('DOMContentLoaded', () => {
  const btnOpenUpload = document.getElementById('btn-open-upload');
  const btnCloseUpload = document.getElementById('btn-close-upload');
  const uploadPanel = document.getElementById('upload-panel');

  const fileSettlements = document.getElementById('file-settlements');
  const fileLedger = document.getElementById('file-ledger');

  const settlementFileName = document.getElementById('settlement-file-name');
  const ledgerFileName = document.getElementById('ledger-file-name');

  const btnProcessUpload = document.getElementById('btn-process-upload');
  const btnDownloadTemplates = document.getElementById('btn-download-templates');

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

  let settlementsFileContent = null;
  let ledgerFileContent = null;

  // Toggle Upload Panel
  btnOpenUpload.addEventListener('click', () => {
    uploadPanel.classList.toggle('hidden');
  });

  btnCloseUpload.addEventListener('click', () => {
    uploadPanel.classList.add('hidden');
  });

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

  // Handle File Selection
  fileSettlements.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      settlementFileName.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      settlementsFileContent = await file.text();
      checkUploadReady();
    }
  });

  fileLedger.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      ledgerFileName.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      ledgerFileContent = await file.text();
      checkUploadReady();
    }
  });

  function checkUploadReady() {
    btnProcessUpload.disabled = !(settlementsFileContent && ledgerFileContent);
  }

  // Handle Upload & Reconcile Real Files
  btnProcessUpload.addEventListener('click', async () => {
    if (!settlementsFileContent || !ledgerFileContent) return;

    setLoading(btnProcessUpload, true, '🚀 Reconciling Real Files...');
    showBanner('Parsing and normalizing real data files...', 'info');

    try {
      const isCsv = fileSettlements.files[0]?.name.endsWith('.csv') || settlementsFileContent.includes(',');
      const res = await fetch('/api/upload-and-reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementsContent: settlementsFileContent,
          ledgerContent: ledgerFileContent,
          fileType: isCsv ? 'csv' : 'json'
        })
      });

      const data = await res.json();
      if (data.success) {
        currentResults = data.results;
        fetchResults();
        showBanner(`Successfully reconciled real files! ${data.message}`, 'info');
        uploadPanel.classList.add('hidden');
      } else {
        showBanner(`Upload Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showBanner(`Error processing files: ${err.message}`, 'error');
    } finally {
      setLoading(btnProcessUpload, false, '🚀 Run Real-Time Reconciliation');
    }
  });

  // Download Sample CSV Templates
  btnDownloadTemplates.addEventListener('click', () => {
    const sampleSettlementCSV = `settlement_id,utr,payment_id,amount,fee,net_amount,settlement_date,customer_name
SETTL_REAL_1001,UTR987654321001,pay_REAL_101,1500,30,1470,2026-08-15T10:00:00Z,Rahul Sharma
SETTL_REAL_1002,UTR987654321002,pay_REAL_102,2400,0,2400,2026-08-15T11:00:00Z,Priya Patel
SETTL_REAL_1003,UTR987654321003,pay_REAL_103_XX,3200,0,3200,2026-08-15T12:00:00Z,Vikram Sethi`;

    const sampleLedgerCSV = `internal_id,payment_ref,utr,gross_amount,order_date,customer_name
ORD_REAL_5001,pay_REAL_101,UTR987654321001,1500,2026-08-15T10:00:00Z,Rahul Sharma
ORD_REAL_5002,pay_REAL_102,UTR987654321002,2400,2026-08-15T11:00:00Z,Priya Patel
ORD_REAL_5003,pay_REAL_103_ST,UTR987654321003,3200,2026-08-15T12:00:00Z,Vikram S.`;

    downloadFile('sample_gateway_settlements.csv', sampleSettlementCSV);
    setTimeout(() => downloadFile('sample_internal_ledger.csv', sampleLedgerCSV), 500);
  });

  function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Demo Actions
  btnGenerate.addEventListener('click', async () => {
    setLoading(btnGenerate, true, 'Generating...');
    showBanner('Generating synthetic dataset with realistic noise...', 'info');
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showBanner(`Generated dataset: ${data.summary.settlementsCount} settlements, ${data.summary.internalLedgerCount} ledger records. Now click "Run Pipeline".`, 'info');
      } else {
        showBanner(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showBanner(`Network error: ${err.message}`, 'error');
    } finally {
      setLoading(btnGenerate, false, '⚡ Demo Data');
    }
  });

  btnReconcile.addEventListener('click', () => handleReconciliation(false));
  btnSimulateFail.addEventListener('click', () => handleReconciliation(true));

  filterLayer.addEventListener('change', renderAuditTable);

  async function handleReconciliation(simulateFailure = false) {
    const btn = simulateFailure ? btnSimulateFail : btnReconcile;
    const label = simulateFailure ? '⚠ Testing Fallback...' : 'Running...';
    const origText = simulateFailure ? '⚠ Test AI Failure Fallback' : '▶ Run Pipeline';

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
    kpiMatchRate.textContent = m.matchRate !== undefined ? `${m.matchRate}%` : `${Math.round((m.totalMatched / (m.totalSettlements || 1)) * 100)}%`;
    kpiMatchedCount.textContent = `${m.totalMatched} / ${m.totalSettlements} settlements matched`;
    kpiPrecision.textContent = m.precision !== undefined ? m.precision : '--';
    kpiRecall.textContent = m.recall !== undefined ? m.recall : '--';
    kpiF1.textContent = m.f1Score !== undefined ? m.f1Score : '--';

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
