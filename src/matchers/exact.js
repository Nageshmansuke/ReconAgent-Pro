/**
 * Layer 1: Deterministic Exact Matcher
 * Matches gateway settlement records against internal ledger records using exact reference/UTR keys
 * and strict amount validation (gross amount match or fee-adjusted net amount match).
 * Amount tolerance is dynamically configurable.
 */

export function exactMatch(settlements, ledgerRecords, options = {}) {
  const tolerance = options.tolerance || parseFloat(process.env.EXACT_AMOUNT_TOLERANCE || '0.05');
  const matched = [];
  const unmatchedSettlements = [];
  const usedLedgerIds = new Set();

  // Map ledger records for O(1) lookup by payment_ref and utr
  const ledgerByRef = new Map();
  const ledgerByUTR = new Map();

  for (const ledger of ledgerRecords) {
    if (ledger.payment_ref) {
      if (!ledgerByRef.has(ledger.payment_ref)) ledgerByRef.set(ledger.payment_ref, []);
      ledgerByRef.get(ledger.payment_ref).push(ledger);
    }
    if (ledger.utr) {
      if (!ledgerByUTR.has(ledger.utr)) ledgerByUTR.set(ledger.utr, []);
      ledgerByUTR.get(ledger.utr).push(ledger);
    }
  }

  for (const settl of settlements) {
    let candidate = null;
    let matchReason = '';

    // Check 1: Match by payment_id / payment_ref
    if (settl.payment_id && ledgerByRef.has(settl.payment_id)) {
      const candidates = ledgerByRef.get(settl.payment_id).filter(l => !usedLedgerIds.has(l.internal_id));
      for (const c of candidates) {
        const amountDiffGross = Math.abs(settl.amount - c.gross_amount);
        const amountDiffNet = Math.abs(settl.net_amount - c.gross_amount);
        const feeAdjustedGross = settl.net_amount + (settl.fee || 0);
        const amountDiffFeeAdj = Math.abs(feeAdjustedGross - c.gross_amount);

        if (amountDiffGross < tolerance) {
          candidate = c;
          matchReason = `Exact match on payment_id (${settl.payment_id}) and gross amount (${settl.amount}).`;
          break;
        } else if (amountDiffNet < tolerance || amountDiffFeeAdj < tolerance) {
          candidate = c;
          matchReason = `Exact match on payment_id (${settl.payment_id}) with fee deduction (net: ${settl.net_amount}, fee: ${settl.fee}, gross: ${c.gross_amount}).`;
          break;
        }
      }
    }

    // Check 2: Match by UTR if payment_id didn't match
    if (!candidate && settl.utr && ledgerByUTR.has(settl.utr)) {
      const candidates = ledgerByUTR.get(settl.utr).filter(l => !usedLedgerIds.has(l.internal_id));
      for (const c of candidates) {
        const amountDiffGross = Math.abs(settl.amount - c.gross_amount);
        const amountDiffNet = Math.abs(settl.net_amount - c.gross_amount);
        const feeAdjustedGross = settl.net_amount + (settl.fee || 0);
        const amountDiffFeeAdj = Math.abs(feeAdjustedGross - c.gross_amount);

        if (amountDiffGross < tolerance) {
          candidate = c;
          matchReason = `Exact match on UTR (${settl.utr}) and gross amount (${settl.amount}).`;
          break;
        } else if (amountDiffNet < tolerance || amountDiffFeeAdj < tolerance) {
          candidate = c;
          matchReason = `Exact match on UTR (${settl.utr}) with fee deduction (net: ${settl.net_amount}, gross: ${c.gross_amount}).`;
          break;
        }
      }
    }

    if (candidate) {
      usedLedgerIds.add(candidate.internal_id);
      matched.push({
        settlement: settl,
        ledger: candidate,
        match_layer: 'exact',
        confidence: 1.0,
        reason: matchReason
      });
    } else {
      unmatchedSettlements.push(settl);
    }
  }

  const unmatchedLedger = ledgerRecords.filter(l => !usedLedgerIds.has(l.internal_id));

  return {
    matched,
    unmatchedSettlements,
    unmatchedLedger
  };
}
