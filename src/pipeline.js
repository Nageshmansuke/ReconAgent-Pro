import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exactMatch } from './matchers/exact.js';
import { fuzzyMatch } from './matchers/fuzzy.js';
import { aiEscalation } from './matchers/aiEscalation.js';
import { calculateMetrics } from './metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

export async function runPipeline(options = {}) {
  const settlementsPath = options.settlementsPath || path.join(DATA_DIR, 'gateway_settlements.json');
  const ledgerPath = options.ledgerPath || path.join(DATA_DIR, 'internal_ledger.json');
  const groundTruthPath = options.groundTruthPath || path.join(DATA_DIR, 'ground_truth.json');

  if (!fs.existsSync(settlementsPath) || !fs.existsSync(ledgerPath)) {
    throw new Error('Data files not found. Please run the generator first.');
  }

  const settlements = JSON.parse(fs.readFileSync(settlementsPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  const groundTruth = fs.existsSync(groundTruthPath)
    ? JSON.parse(fs.readFileSync(groundTruthPath, 'utf8'))
    : [];

  const startTime = Date.now();

  // Layer 1: Exact Match (Deterministic)
  const l1Result = exactMatch(settlements, ledger);

  // Layer 2: Fuzzy Match (Deterministic)
  const l2Result = fuzzyMatch(l1Result.unmatchedSettlements, l1Result.unmatchedLedger);

  // Layer 3: AI Escalation (Bounded)
  const l3Result = await aiEscalation(
    l2Result.unmatchedSettlements,
    l2Result.unmatchedLedger,
    options
  );

  const durationMs = Date.now() - startTime;

  const allMatched = [
    ...l1Result.matched,
    ...l2Result.matched,
    ...l3Result.matched
  ];

  const unresolvedSettlements = l3Result.unmatchedSettlements;
  const unresolvedLedger = l3Result.unmatchedLedger;

  // Calculate honest metrics against ground truth
  const metrics = calculateMetrics(allMatched, unresolvedSettlements, groundTruth);
  metrics.executionTimeMs = durationMs;
  metrics.layerBreakdown = {
    exact: l1Result.matched.length,
    fuzzy: l2Result.matched.length,
    ai: l3Result.matched.length,
    unresolvedSettlements: unresolvedSettlements.length,
    unresolvedLedger: unresolvedLedger.length
  };

  // Build granular audit log per input record
  const auditLog = [];

  for (const m of allMatched) {
    auditLog.push({
      settlement_id: m.settlement.settlement_id,
      internal_id: m.ledger.internal_id,
      payment_id: m.settlement.payment_id,
      utr: m.settlement.utr,
      amount: m.settlement.amount,
      status: 'matched',
      resolving_layer: m.match_layer,
      confidence: m.confidence,
      reason: m.reason,
      timestamp: new Date().toISOString()
    });
  }

  for (const un of unresolvedSettlements) {
    auditLog.push({
      settlement_id: un.settlement_id,
      internal_id: null,
      payment_id: un.payment_id,
      utr: un.utr,
      amount: un.amount,
      status: 'unresolved',
      resolving_layer: 'none',
      confidence: 0,
      reason: un.unresolved_reason || 'unresolved — flagged for human review',
      timestamp: new Date().toISOString()
    });
  }

  const resultsSummary = {
    timestamp: new Date().toISOString(),
    metrics,
    matched: allMatched,
    exceptions: {
      unresolvedSettlements,
      unresolvedLedger
    }
  };

  // Persist outputs
  fs.writeFileSync(path.join(DATA_DIR, 'audit_log.json'), JSON.stringify(auditLog, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'results.json'), JSON.stringify(resultsSummary, null, 2));

  return resultsSummary;
}

// Execute directly if invoked via CLI
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runPipeline().then(results => {
    console.log('Reconciliation Pipeline Complete:');
    console.log(`- Match Rate: ${results.metrics.matchRate}%`);
    console.log(`- Precision: ${results.metrics.precision}`);
    console.log(`- Recall: ${results.metrics.recall}`);
    console.log('- Layer Breakdown:', results.metrics.layerBreakdown);
  }).catch(err => {
    console.error('Pipeline failed:', err);
  });
}
