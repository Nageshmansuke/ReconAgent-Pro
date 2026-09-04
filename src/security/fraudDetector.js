/**
 * Fraud & Security Attack Detector for ReconAgent
 * Scans gateway settlements and internal ledgers to detect:
 * 1. Ghost Settlements (bank money landed with no corresponding internal order)
 * 2. UTR Reuse / Multi-Account Attacks (same UTR recycled across different customer names)
 * 3. High-Value Anomaly Spikes (>3x average volume)
 */

export function detectFraudAnomalies(settlements = [], ledger = [], auditLogs = []) {
  const anomalies = [];
  let anomalyIdCounter = 1;

  // 1. Ghost Settlements: Bank money landed with no internal ledger record anywhere
  const unlinkedSettlements = auditLogs.filter(a => a.status === 'unresolved' || a.resolving_layer === 'none');
  const ghostSettlements = unlinkedSettlements.filter(s => {
    // Check if customer or payment ref is missing or completely unmapped
    return !s.internal_id;
  });

  if (ghostSettlements.length > 0) {
    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'GHOST_SETTLEMENT',
      severity: 'critical',
      title: '🛡️ Ghost Settlement Detection',
      description: `${ghostSettlements.length} settlement payout(s) landed in bank account with zero matching internal order history. Possible unrecorded sales or unauthorized bank credit.`,
      records: ghostSettlements.slice(0, 5).map(g => ({
        settlement_id: g.settlement_id,
        amount: g.amount,
        utr: g.utr
      }))
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
        recycledUTRs.push({ utr, count: items.length, names: Array.from(uniqueNames) });
      }
    }
  }

  if (recycledUTRs.length > 0) {
    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'UTR_REUSE_ATTACK',
      severity: 'critical',
      title: '🚨 UTR Reuse Across Multiple Accounts',
      description: `Detected ${recycledUTRs.length} bank UTR(s) reused across different customer names. High risk of promo abuse, refund manipulation, or compromised gateway ref.`,
      records: recycledUTRs
    });
  }

  // 3. High-Value Anomaly Spike Detection (>3x average transaction size)
  const totalVolume = settlements.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avgAmount = settlements.length > 0 ? totalVolume / settlements.length : 0;
  const spikeThreshold = avgAmount * 3;

  const spikeSettlements = settlements.filter(s => (s.amount || 0) > spikeThreshold);
  if (spikeSettlements.length > 0) {
    anomalies.push({
      id: `SEC_${anomalyIdCounter++}`,
      type: 'HIGH_VALUE_SPIKE',
      severity: 'warning',
      title: '⚡ Unusual High-Value Transaction Spike',
      description: `${spikeSettlements.length} settlement(s) exceed 3x the average transaction volume (₹${Math.round(avgAmount).toLocaleString()}).`,
      records: spikeSettlements.map(s => ({ settlement_id: s.settlement_id, amount: s.amount, customer: s.customer_name }))
    });
  }

  return anomalies;
}
