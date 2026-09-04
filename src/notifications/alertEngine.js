/**
 * Dynamic Alert & Notification Engine for ReconAgent
 * Scans live reconciliation results, audit logs, and exceptions to generate
 * real-time prioritized financial risk alerts.
 * All thresholds are dynamically configurable via environment variables or options.
 */

export function generateAlerts(reconciliationResults, auditLogs = [], options = {}) {
  const alerts = [];
  const metrics = reconciliationResults?.metrics || {};
  const unresolved = reconciliationResults?.exceptions?.unresolvedSettlements || [];
  const matched = reconciliationResults?.matched || [];

  // Dynamic configuration thresholds from env or options
  const highValueThreshold = options.highValueThreshold || parseFloat(process.env.ALERT_HIGH_VALUE_THRESHOLD || '3000');
  const maxFeePct = options.maxFeePct || parseFloat(process.env.ALERT_MAX_FEE_PCT || '2.5');

  let alertIdCounter = 1;

  // 1. High Severity: Unresolved Exceptions / Exposure
  if (unresolved.length > 0) {
    const totalExposure = unresolved.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const highValCount = unresolved.filter(s => (Number(s.amount) || 0) >= highValueThreshold).length;

    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'HIGH',
      category: 'UNRESOLVED_EXPOSURE',
      title: 'High Exposure Exception Queue',
      message: `${unresolved.length} unresolved settlement(s) total ₹${totalExposure.toLocaleString('en-IN')} open exposure. ${highValCount ? `${highValCount} record(s) exceed ₹${highValueThreshold.toLocaleString('en-IN')}.` : ''}`,
      action: 'Review exceptions in Human Queue & execute Force Match or Write Off',
      targetTab: 'exceptions',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Medium Severity: Gateway Fee Anomaly
  const feeAnomalies = matched.filter(m => {
    const s = m.settlement;
    if (!s || !s.amount || s.amount === 0) return false;
    const feePct = ((Number(s.fee) || 0) / Number(s.amount)) * 100;
    return feePct > maxFeePct;
  });

  if (feeAnomalies.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'MEDIUM',
      category: 'FEE_ANOMALY',
      title: 'Gateway Fee Rate Threshold Exceeded',
      message: `${feeAnomalies.length} transaction(s) have fee deductions exceeding expected rate of ${maxFeePct}%.`,
      action: 'Inspect fee breakdown in Audit Trail',
      targetTab: 'audit',
      filter: 'exact',
      timestamp: new Date().toISOString()
    });
  }

  // 3. Medium Severity: Duplicate Gateway Charges / UTR Flags
  const duplicateLogs = auditLogs.filter(a => a.reason && a.reason.toLowerCase().includes('duplicate'));
  if (duplicateLogs.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'MEDIUM',
      category: 'DUPLICATE_SETTLEMENT',
      title: 'Duplicate Settlement Row Detected',
      message: `${duplicateLogs.length} duplicate settlement entry/entries flagged during execution. Risk of duplicate payout ledgering.`,
      action: 'Verify transaction refs in Security Radar',
      targetTab: 'security',
      timestamp: new Date().toISOString()
    });
  }

  // 4. Low Severity: Layer 2 / Fuzzy Matches
  const fuzzyCount = metrics.layerBreakdown?.fuzzy || 0;
  if (fuzzyCount > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'LOW',
      category: 'FUZZY_RESOLUTION',
      title: 'Fuzzy Matching Applied',
      message: `${fuzzyCount} settlement(s) were resolved using reference/name similarity & date windowing.`,
      action: 'Audit fuzzy match confidence scores',
      targetTab: 'audit',
      filter: 'fuzzy',
      timestamp: new Date().toISOString()
    });
  }

  // 5. Low Severity: Pipeline Completion Summary
  alerts.push({
    id: `ALERT_${alertIdCounter++}`,
    severity: 'LOW',
    category: 'PIPELINE_COMPLETE',
    title: 'Reconciliation Engine Run Completed',
    message: `Processed ${metrics.totalSettlements || 0} settlements with ${metrics.matchRate || 0}% match rate in ${metrics.executionTimeMs || 0}ms.`,
    action: 'View execution breakdown in Audit Trail',
    targetTab: 'audit',
    filter: 'all',
    timestamp: new Date().toISOString()
  });

  return alerts;
}
