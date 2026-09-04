/**
 * Metrics Calculator
 * Evaluates pipeline reconciliation predictions against ground_truth.json answer key.
 * Calculates Match Rate, Precision, Recall, and F1 Score.
 */

export function calculateMetrics(matchedResults, unresolvedSettlements, groundTruth) {
  // Build ground truth lookup map: settlement_id -> internal_id
  const gtMap = new Map();
  let expectedMatchableCount = 0;

  for (const gt of groundTruth) {
    if (gt.settlement_id && gt.internal_id) {
      gtMap.set(gt.settlement_id, gt.internal_id);
      if (gt.noise_type !== 'duplicate') {
        expectedMatchableCount++;
      }
    }
  }

  let truePositives = 0;
  let falsePositives = 0;

  for (const m of matchedResults) {
    const sId = m.settlement.settlement_id;
    const predictedLedgerId = m.ledger.internal_id;
    const actualLedgerId = gtMap.get(sId);

    if (actualLedgerId === predictedLedgerId) {
      truePositives++;
    } else {
      falsePositives++;
    }
  }

  // False Negatives: Matchable in GT but left unresolved
  let falseNegatives = 0;
  for (const un of unresolvedSettlements) {
    const sId = un.settlement_id;
    if (gtMap.has(sId)) {
      falseNegatives++;
    }
  }

  const totalSettlements = matchedResults.length + unresolvedSettlements.length;
  const matchRate = totalSettlements > 0 ? matchedResults.length / totalSettlements : 0;
  const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
  const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    totalSettlements,
    totalMatched: matchedResults.length,
    totalUnresolved: unresolvedSettlements.length,
    matchRate: Math.round(matchRate * 1000) / 10, // e.g. 87.5%
    truePositives,
    falsePositives,
    falseNegatives,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1Score: Math.round(f1Score * 1000) / 1000
  };
}
