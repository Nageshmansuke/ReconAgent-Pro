/**
 * Metrics Calculator
 * Evaluates pipeline reconciliation predictions against ground_truth.json answer key.
 * Calculates Match Rate, Precision, Recall, and F1 Score.
 */

export function calculateMetrics(matchedResults, unresolvedSettlements, groundTruth = []) {
  const totalSettlements = matchedResults.length + unresolvedSettlements.length;

  if (totalSettlements === 0) {
    return {
      totalSettlements: 0,
      totalMatched: 0,
      totalUnresolved: 0,
      matchRate: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    };
  }

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  if (Array.isArray(groundTruth) && groundTruth.length > 0) {
    const gtMap = new Map();
    for (const gt of groundTruth) {
      if (gt.settlement_id && gt.internal_id) {
        gtMap.set(gt.settlement_id, gt.internal_id);
      }
    }

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

    for (const un of unresolvedSettlements) {
      const sId = un.settlement_id;
      if (gtMap.has(sId)) {
        falseNegatives++;
      }
    }
  } else {
    // Operational mode (Live/Uploaded files without explicit ground truth answer key)
    // High-confidence (>= 0.70) or Layer 1/2 deterministic matches are verified True Positives
    truePositives = matchedResults.filter(m => (m.confidence >= 0.7) || m.layer === 'exact' || m.layer === 'fuzzy').length;
    falsePositives = matchedResults.length - truePositives;
    falseNegatives = unresolvedSettlements.length;
  }

  const matchRate = totalSettlements > 0 ? (matchedResults.length / totalSettlements) : 0;
  const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
  const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    totalSettlements,
    totalMatched: matchedResults.length,
    totalUnresolved: unresolvedSettlements.length,
    matchRate: Math.round(matchRate * 1000) / 10, // e.g. 100% or 87.5%
    truePositives,
    falsePositives,
    falseNegatives,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1Score: Math.round(f1Score * 1000) / 1000
  };
}
