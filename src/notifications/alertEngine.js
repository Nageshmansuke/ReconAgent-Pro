/**
 * Dynamic Alert & Notification Engine for ReconAgent
 * Scans live reconciliation results, audit logs, and exceptions to generate
 * real-time prioritized financial risk alerts.
 * All thresholds are dynamically configurable via environment variables or options.
 */

export function generateAlerts(reconciliationResults, auditLogs = [], options = {}) {
  const alerts = [];
  const metrics = reconciliationResults.metrics || {};
  const unresolved = reconciliationResults.exceptions?.unresolvedSettlements || [];
  const matched = reconciliationResults.matched || [];

  // Dynamic configuration thresholds from env or options
  const highValueThreshold = options.highValueThreshold || parseFloat(process.env.ALERT_HIGH_VALUE_THRESHOLD || '5000');
  const maxFeePct = options.maxFeePct || parseFloat(process.env.ALERT_MAX_FEE_PCT || '3.0');

  let alertIdCounter = 1;

  // 1. Critical Alert: High-Value Unresolved Discrepancies
  const highValueExceptions = unresolved.filter(s => (s.amount || 0) >= highValueThreshold);
  if (highValueExceptions.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'critical',
      category: 'HIGH_VALUE_EXCEPTION',
      title: '🚨 High-Value Unresolved Discrepancy',
      message: `${highValueExceptions.length} unresolved settlement(s) equal to or over ${highValueThreshold.toLocaleString()} requiring immediate manual review.`,
      records: highValueExceptions.map(s => ({
        id: s.settlement_id,
        amount: s.amount,
        customer: s.customer_name
      })),
      timestamp: new Date().toISOString()
    });
  }

  // 2. Warning Alert: Fee Rate Anomaly
  const feeAnomalies = matched.filter(m => {
    const s = m.settlement;
    if (!s || !s.amount || s.amount === 0) return false;
    const feePct = ((s.fee || 0) / s.amount) * 100;
    return feePct > maxFeePct;
  });

  if (feeAnomalies.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'warning',
      category: 'FEE_ANOMALY',
      title: '⚠️ Gateway Fee Anomaly Detected',
      message: `${feeAnomalies.length} transaction(s) have gateway fees higher than the configured ${maxFeePct}% rate threshold.`,
      records: feeAnomalies.map(m => ({
        settlement_id: m.settlement.settlement_id,
        amount: m.settlement.amount,
        fee: m.settlement.fee,
        fee_pct: `${(((m.settlement.fee || 0) / m.settlement.amount) * 100).toFixed(1)}%`
      })),
      timestamp: new Date().toISOString()
    });
  }

  // 3. Warning Alert: Duplicate Gateway Charges
  const duplicateLogs = auditLogs.filter(a => a.reason && a.reason.toLowerCase().includes('duplicate'));
  if (duplicateLogs.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'warning',
      category: 'DUPLICATE_SETTLEMENT',
      title: '⚠️ Duplicate Gateway Charges',
      message: `${duplicateLogs.length} duplicate settlement row(s) detected in gateway data. Risk of double-payout.`,
      records: duplicateLogs.map(d => ({ id: d.settlement_id, amount: d.amount })),
      timestamp: new Date().toISOString()
    });
  }

  // 4. Info Alert: AI Human Review Required
  const aiFallbacks = unresolved.filter(u => u.unresolved_reason && u.unresolved_reason.includes('flagged for human review'));
  if (aiFallbacks.length > 0 && reconciliationResults.metrics?.layerBreakdown?.ai === 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'info',
      category: 'AI_FALLBACK',
      title: 'ℹ️ AI Escalation Human Review Required',
      message: `${aiFallbacks.length} record(s) could not be resolved with high confidence and were safely flagged for human review.`,
      timestamp: new Date().toISOString()
    });
  }

  // 5. Success/Summary Alert
  alerts.push({
    id: `ALERT_${alertIdCounter++}`,
    severity: 'success',
    category: 'RECON_SUMMARY',
    title: '✅ Live Reconciliation Completed',
    message: `Processed ${metrics.totalSettlements || 0} settlements with ${metrics.matchRate || 0}% match rate in ${metrics.executionTimeMs || 0}ms.`,
    timestamp: new Date().toISOString()
  });

  return alerts;
}
