/**
 * Alert & Notification Engine for ReconAgent
 * Scans reconciliation results, audit logs, and exceptions to generate
 * actionable, prioritized financial alerts (Critical, Warning, Info).
 */

export function generateAlerts(reconciliationResults, auditLogs = []) {
  const alerts = [];
  const metrics = reconciliationResults.metrics || {};
  const unresolved = reconciliationResults.exceptions?.unresolvedSettlements || [];
  const matched = reconciliationResults.matched || [];

  let alertIdCounter = 1;

  // 1. Critical Alert: High-Value Unresolved Settlements (>= ₹5,000)
  const highValueExceptions = unresolved.filter(s => (s.amount || 0) >= 5000);
  if (highValueExceptions.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'critical',
      category: 'HIGH_VALUE_EXCEPTION',
      title: '🚨 High-Value Unresolved Discrepancy',
      message: `${highValueExceptions.length} unresolved settlement(s) total over ₹5,000 requiring immediate manual review.`,
      records: highValueExceptions.map(s => ({
        id: s.settlement_id,
        amount: s.amount,
        customer: s.customer_name
      })),
      timestamp: new Date().toISOString()
    });
  }

  // 2. Warning Alert: Fee Anomaly (>3% Fee Deduction)
  const feeAnomalies = matched.filter(m => {
    const s = m.settlement;
    if (!s || !s.amount || s.amount === 0) return false;
    const feePct = ((s.fee || 0) / s.amount) * 100;
    return feePct > 3.0; // Fee higher than standard 3% rate
  });

  if (feeAnomalies.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'warning',
      category: 'FEE_ANOMALY',
      title: '⚠️ Gateway Fee Anomaly Detected',
      message: `${feeAnomalies.length} transaction(s) have gateway fees higher than the 3% standard rate.`,
      records: feeAnomalies.map(m => ({
        settlement_id: m.settlement.settlement_id,
        amount: m.settlement.amount,
        fee: m.settlement.fee,
        fee_pct: `${(((m.settlement.fee || 0) / m.settlement.amount) * 100).toFixed(1)}%`
      })),
      timestamp: new Date().toISOString()
    });
  }

  // 3. Warning Alert: Duplicate Settlements Detected
  const duplicateLogs = auditLogs.filter(a => a.reason && a.reason.toLowerCase().includes('duplicate'));
  if (duplicateLogs.length > 0) {
    alerts.push({
      id: `ALERT_${alertIdCounter++}`,
      severity: 'warning',
      category: 'DUPLICATE_SETTLEMENT',
      title: '⚠️ Duplicate Gateway Charges',
      message: `${duplicateLogs.length} duplicate settlement row(s) detected in gateway files. Risk of double-payout.`,
      records: duplicateLogs.map(d => ({ id: d.settlement_id, amount: d.amount })),
      timestamp: new Date().toISOString()
    });
  }

  // 4. Info/Warning Alert: AI Fallback Triggered
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

  // 5. Success/Summary Notification
  alerts.push({
    id: `ALERT_${alertIdCounter++}`,
    severity: 'success',
    category: 'RECON_SUMMARY',
    title: '✅ Reconciliation Run Completed',
    message: `Processed ${metrics.totalSettlements || 0} settlements with ${metrics.matchRate || 0}% match rate in ${metrics.executionTimeMs || 0}ms.`,
    timestamp: new Date().toISOString()
  });

  return alerts;
}
