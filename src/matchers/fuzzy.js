import stringSimilarity from 'string-similarity';

/**
 * Layer 2: Deterministic Fuzzy Matcher
 * Operates strictly on leftovers from Layer 1.
 * Uses string-similarity (Levenshtein/Dice coefficient) on names and reference strings,
 * combined with date windows (+/- 5 days) and amount tolerance checks.
 */
export function fuzzyMatch(unmatchedSettlements, unmatchedLedger, options = {}) {
  const threshold = options.threshold || 0.75;
  const matched = [];
  const remainingSettlements = [];
  const usedLedgerIds = new Set();

  for (const settl of unmatchedSettlements) {
    let bestCandidate = null;
    let maxScore = 0;
    let matchReason = '';

    const settlDate = new Date(settl.settlement_date);

    for (const ledger of unmatchedLedger) {
      if (usedLedgerIds.has(ledger.internal_id)) continue;

      const ledgerDate = new Date(ledger.order_date);
      const dayDiff = Math.abs(settlDate - ledgerDate) / (1000 * 60 * 60 * 24);

      // Require date window within 7 days
      if (dayDiff > 7) continue;

      // Amount checks
      const amountDiffGross = Math.abs(settl.amount - ledger.gross_amount);
      const amountDiffNet = Math.abs(settl.net_amount - ledger.gross_amount);
      const feeAdjustedGross = settl.net_amount + (settl.fee || 0);
      const amountDiffFeeAdj = Math.abs(feeAdjustedGross - ledger.gross_amount);

      const exactAmountMatch = amountDiffGross < 0.05 || amountDiffNet < 0.05 || amountDiffFeeAdj < 0.05;

      // String similarity metrics
      const nameSim = settl.customer_name && ledger.customer_name
        ? stringSimilarity.compareTwoStrings(settl.customer_name.toLowerCase(), ledger.customer_name.toLowerCase())
        : 0;

      const refSim = settl.payment_id && ledger.payment_ref
        ? stringSimilarity.compareTwoStrings(settl.payment_id.toLowerCase(), ledger.payment_ref.toLowerCase())
        : 0;

      const utrSim = settl.utr && ledger.utr
        ? stringSimilarity.compareTwoStrings(settl.utr.toLowerCase(), ledger.utr.toLowerCase())
        : 0;

      // Calculate composite match score
      let score = 0;

      if (exactAmountMatch) {
        // Amount matches exact or net fee; score based on name or reference similarity
        const maxStringSim = Math.max(nameSim, refSim, utrSim);
        if (maxStringSim >= threshold) {
          score = maxStringSim;
          if (score > maxScore) {
            maxScore = score;
            bestCandidate = ledger;
            matchReason = `Fuzzy match with exact amount (${settl.amount}): name/ref similarity ${maxStringSim.toFixed(2)} ("${settl.customer_name}" vs "${ledger.customer_name}").`;
          }
        }
      }
    }

    if (bestCandidate && maxScore >= threshold) {
      usedLedgerIds.add(bestCandidate.internal_id);
      matched.push({
        settlement: settl,
        ledger: bestCandidate,
        match_layer: 'fuzzy',
        confidence: Math.round(maxScore * 100) / 100,
        reason: matchReason
      });
    } else {
      remainingSettlements.push(settl);
    }
  }

  const remainingLedger = unmatchedLedger.filter(l => !usedLedgerIds.has(l.internal_id));

  return {
    matched,
    unmatchedSettlements: remainingSettlements,
    unmatchedLedger: remainingLedger
  };
}
