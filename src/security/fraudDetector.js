/**
 * Fraud & Security Attack Detector for ReconAgent
 * Scans gateway settlements and internal ledgers to detect:
 * 1. Ghost Settlements (bank money landed with no corresponding internal order)
 * 2. UTR Reuse / Multi-Account Attacks (same UTR recycled across different customer names)
 * 3. High-Value Anomaly Spikes (>3x average volume)
 * 4. Duplicate Settlement Risk
 */

export function detectFraudAnomalies(settlements = [], ledger = [], auditLogs = []) {
  const anomalies = [];
  let anomalyIdCounter = 1;

  // 1. Ghost Settlements: Bank money landed with no internal ledger record anywhere
  const unresolvedLogs = auditLogs.filter(a => a.status === 'unresolved' || a.resolving_layer === 'none');
  if (unresolvedLogs.length > 0) {
    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'GHOST SETTLEMENT ANOMALY',
      severity: 'HIGH',
      details: `${unresolvedLogs.length} settlement payout(s) landed in gateway reports with zero matching internal sales order history. Risk of unauthorized credit or unrecorded sales.`,
      affectedRecords: unresolvedLogs.slice(0, 5).map(g => ({
        settlement_id: g.settlement_id || 'SETTL_UNK',
        utr: g.utr || 'UTR_UNAVAIL',
        amount: g.amount || 0
      })),
      mitigation: 'Verify bank deposit statements against ledger exceptions queue',
      targetTab: 'exceptions',
      filter: 'none'
    });
  }

  // 2. UTR Reuse / Multi-Account Attacks: Same UTR attached to multiple customer names
  const utrMap = new Map();
  for (const s of settlements) {
    if (!s.utr) continue;
    if (!utrMap.has(s.utr)) utrMap.set(s.utr, []);
    utrMap.get(s.utr).push(s);
  }

  const recycledUTRs = [];
  for (const [utr, items] of utrMap.entries()) {
    if (items.length > 1) {
      const uniqueNames = new Set(items.map(i => i.customer_name?.toLowerCase()).filter(Boolean));
      if (uniqueNames.size > 1) {
        recycledUTRs.push({ utr, items });
      }
    }
  }

  if (recycledUTRs.length > 0) {
    const affected = recycledUTRs.flatMap(r => r.items.map(i => ({
      settlement_id: i.settlement_id,
      utr: r.utr,
      amount: i.amount
    }))).slice(0, 5);

    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'UTR REUSE ATTACK',
      severity: 'HIGH',
      details: `Detected ${recycledUTRs.length} bank UTR(s) reused across different customer accounts. High risk of promo abuse, refund manipulation, or fake UTR injection.`,
      affectedRecords: affected,
      mitigation: 'Block duplicate UTR payouts and request bank transfer receipts',
      targetTab: 'audit',
      filter: 'all'
    });
  }

  // 3. High-Value Anomaly Spike Detection (>3x average transaction size)
  const totalVolume = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const avgAmount = settlements.length > 0 ? totalVolume / settlements.length : 0;
  const spikeThreshold = Math.max(avgAmount * 3, 7000);

  const spikeSettlements = settlements.filter(s => (Number(s.amount) || 0) > spikeThreshold);
  if (spikeSettlements.length > 0) {
    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'HIGH VALUE TRANSACTION SPIKE',
      severity: 'MEDIUM',
      details: `${spikeSettlements.length} settlement(s) exceed 3x average volume (threshold: ₹${Math.round(spikeThreshold).toLocaleString('en-IN')}).`,
      affectedRecords: spikeSettlements.slice(0, 5).map(s => ({
        settlement_id: s.settlement_id,
        utr: s.utr || s.payment_id,
        amount: s.amount
      })),
      mitigation: 'Require dual CFO sign-off on settlements exceeding high volume threshold',
      targetTab: 'audit',
      filter: 'exact'
    });
  }

  // 4. Duplicate Settlement Entry Warning
  const duplicates = auditLogs.filter(a => a.reason && a.reason.toLowerCase().includes('duplicate'));
  if (duplicates.length > 0) {
    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'DUPLICATE SETTLEMENT ROW RISK',
      severity: 'MEDIUM',
      details: `${duplicates.length} settlement row(s) share identical transaction references with prior settled items.`,
      affectedRecords: duplicates.slice(0, 5).map(d => ({
        settlement_id: d.settlement_id,
        utr: d.utr,
        amount: d.amount
      })),
      mitigation: 'Deduplicate gateway feed before posting to main accounting ledger',
      targetTab: 'audit',
      filter: 'exact'
    });
  }

  return anomalies;
}
