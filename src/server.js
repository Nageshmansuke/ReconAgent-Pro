import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateSyntheticData } from './generator.js';
import { runPipeline } from './pipeline.js';
import { parseCSV, normalizeSettlementData, normalizeLedgerData } from './parsers/csvParser.js';
import { generateAlerts } from './notifications/alertEngine.js';
import { detectFraudAnomalies } from './security/fraudDetector.js';
import { queryFinanceCopilot } from './copilot/financeCopilot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ReconAgent Pro', version: '2.5.0' });
});

// Generate synthetic datasets
app.post('/api/generate', (req, res) => {
  try {
    const seed = req.body?.seed ? parseInt(req.body.seed) : Math.floor(Math.random() * 10000);
    const summary = generateSyntheticData(seed);
    res.json({
      success: true,
      message: 'Synthetic datasets generated successfully.',
      summary
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload Real Data Files & Reconcile
app.post('/api/upload-and-reconcile', async (req, res) => {
  try {
    const { settlementsContent, ledgerContent, fileType, simulateFailure } = req.body;

    if (!settlementsContent || !ledgerContent) {
      return res.status(400).json({
        success: false,
        error: 'Both Gateway Settlement file and Internal Ledger file are required.'
      });
    }

    let settlementsRaw = [];
    let ledgerRaw = [];

    if (fileType === 'csv' || typeof settlementsContent === 'string' && settlementsContent.includes(',')) {
      settlementsRaw = parseCSV(settlementsContent);
      ledgerRaw = parseCSV(ledgerContent);
    } else {
      settlementsRaw = typeof settlementsContent === 'string' ? JSON.parse(settlementsContent) : settlementsContent;
      ledgerRaw = typeof ledgerContent === 'string' ? JSON.parse(ledgerContent) : ledgerContent;
    }

    const settlementsNormalized = normalizeSettlementData(settlementsRaw);
    const ledgerNormalized = normalizeLedgerData(ledgerRaw);

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(path.join(DATA_DIR, 'gateway_settlements.json'), JSON.stringify(settlementsNormalized, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'internal_ledger.json'), JSON.stringify(ledgerNormalized, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'ground_truth.json'), JSON.stringify([], null, 2));

    const results = await runPipeline({ simulateFailure: simulateFailure === true });

    const auditPath = path.join(DATA_DIR, 'audit_log.json');
    const auditLog = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : [];
    
    // Generate risk alerts & security anomalies
    const alerts = generateAlerts(results, auditLog);
    const securityAnomalies = detectFraudAnomalies(settlementsNormalized, ledgerNormalized, auditLog);

    fs.writeFileSync(path.join(DATA_DIR, 'alerts.json'), JSON.stringify(alerts, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'security.json'), JSON.stringify(securityAnomalies, null, 2));

    res.json({
      success: true,
      message: `Reconciled ${settlementsNormalized.length} settlements against ${ledgerNormalized.length} ledger orders successfully.`,
      results,
      alerts,
      securityAnomalies
    });
  } catch (err) {
    console.error('Error processing real data files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run reconciliation pipeline
app.post('/api/reconcile', async (req, res) => {
  try {
    const simulateFailure = req.body?.simulateFailure === true;
    const results = await runPipeline({ simulateFailure });

    const settlementsPath = path.join(DATA_DIR, 'gateway_settlements.json');
    const ledgerPath = path.join(DATA_DIR, 'internal_ledger.json');
    const auditPath = path.join(DATA_DIR, 'audit_log.json');

    const settlements = fs.existsSync(settlementsPath) ? JSON.parse(fs.readFileSync(settlementsPath, 'utf8')) : [];
    const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : [];
    const auditLog = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : [];

    const alerts = generateAlerts(results, auditLog);
    const securityAnomalies = detectFraudAnomalies(settlements, ledger, auditLog);

    fs.writeFileSync(path.join(DATA_DIR, 'alerts.json'), JSON.stringify(alerts, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'security.json'), JSON.stringify(securityAnomalies, null, 2));

    res.json({
      success: true,
      message: 'Reconciliation pipeline completed successfully.',
      results,
      alerts,
      securityAnomalies
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Natural Language Ask Recon Copilot Route
app.post('/api/copilot/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required.' });
    }

    const resultsPath = path.join(DATA_DIR, 'results.json');
    const auditPath = path.join(DATA_DIR, 'audit_log.json');

    const results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath, 'utf8')) : {};
    const auditLog = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : [];

    const copilotAnswer = await queryFinanceCopilot(query, results, auditLog);
    res.json({ success: true, copilotAnswer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resolve Exception (Force Match or Write-Off)
app.post('/api/exceptions/resolve', (req, res) => {
  try {
    const { settlement_id, action, matched_internal_id, note } = req.body;
    if (!settlement_id || !action) {
      return res.status(400).json({ success: false, error: 'settlement_id and action (force_match | write_off) are required.' });
    }

    const resultsPath = path.join(DATA_DIR, 'results.json');
    const auditPath = path.join(DATA_DIR, 'audit_log.json');
    const settlementsPath = path.join(DATA_DIR, 'gateway_settlements.json');
    const ledgerPath = path.join(DATA_DIR, 'internal_ledger.json');

    if (!fs.existsSync(resultsPath) || !fs.existsSync(auditPath)) {
      return res.status(400).json({ success: false, error: 'No active reconciliation run found to update.' });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    let auditLog = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    const settlements = fs.existsSync(settlementsPath) ? JSON.parse(fs.readFileSync(settlementsPath, 'utf8')) : [];
    const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : [];

    const unresolvedList = results.exceptions?.unresolvedSettlements || [];
    const targetIdx = unresolvedList.findIndex(s => s.settlement_id === settlement_id);

    if (targetIdx === -1) {
      return res.status(404).json({ success: false, error: `Settlement ${settlement_id} not found in unresolved exceptions.` });
    }

    const targetItem = unresolvedList[targetIdx];
    unresolvedList.splice(targetIdx, 1);

    if (action === 'force_match') {
      const matchedRecord = {
        settlement: targetItem,
        ledger: { internal_id: matched_internal_id || 'ORD_MANUAL_MATCH', customer_name: targetItem.customer_name || 'Manual Customer' },
        resolvingLayer: 'human',
        confidence: 1.0,
        reason: `Manual force match by Finance Ops${note ? `: ${note}` : ''}`
      };
      if (!results.matched) results.matched = [];
      results.matched.push(matchedRecord);
    } else if (action === 'write_off') {
      if (!results.exceptions.writtenOff) results.exceptions.writtenOff = [];
      results.exceptions.writtenOff.push({
        ...targetItem,
        written_off_at: new Date().toISOString(),
        reason: `Written off by Finance Manager${note ? `: ${note}` : ''}`
      });
    }

    // Update audit log
    const auditIdx = auditLog.findIndex(a => a.settlement_id === settlement_id);
    if (auditIdx !== -1) {
      auditLog[auditIdx].status = action === 'force_match' ? 'matched' : 'written_off';
      auditLog[auditIdx].resolving_layer = 'human';
      auditLog[auditIdx].confidence = 1.0;
      if (action === 'force_match') auditLog[auditIdx].internal_id = matched_internal_id || 'ORD_MANUAL_MATCH';
      auditLog[auditIdx].reason = action === 'force_match' 
        ? `Manual force match by Finance Ops${note ? `: ${note}` : ''}` 
        : `Written off by Finance Manager${note ? `: ${note}` : ''}`;
    }

    // Recalculate metrics
    const totalSettlements = results.metrics?.totalSettlements || settlements.length || 1;
    const totalMatched = (results.matched || []).length;
    const totalUnresolved = (results.exceptions?.unresolvedSettlements || []).length;

    results.metrics = {
      ...results.metrics,
      totalMatched,
      totalUnresolved,
      matchRate: parseFloat(((totalMatched / totalSettlements) * 100).toFixed(1)),
      layerBreakdown: {
        ...results.metrics?.layerBreakdown,
        unresolvedSettlements: totalUnresolved
      }
    };

    // Regenerate alerts & security anomalies
    const alerts = generateAlerts(results, auditLog);
    const securityAnomalies = detectFraudAnomalies(settlements, ledger, auditLog);

    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'alerts.json'), JSON.stringify(alerts, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'security.json'), JSON.stringify(securityAnomalies, null, 2));

    res.json({
      success: true,
      message: action === 'force_match' ? `Settlement ${settlement_id} successfully force-matched.` : `Settlement ${settlement_id} successfully written off.`,
      results,
      auditLog,
      alerts,
      securityAnomalies
    });
  } catch (err) {
    console.error('Error resolving exception:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch latest results, audit log, alerts & security
app.get('/api/results', (req, res) => {
  try {
    const resultsPath = path.join(DATA_DIR, 'results.json');
    const auditPath = path.join(DATA_DIR, 'audit_log.json');
    const alertsPath = path.join(DATA_DIR, 'alerts.json');
    const securityPath = path.join(DATA_DIR, 'security.json');

    if (!fs.existsSync(resultsPath)) {
      return res.json({
        hasData: false,
        message: 'No reconciliation results found yet.'
      });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const auditLog = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : [];
    const alerts = fs.existsSync(alertsPath) ? JSON.parse(fs.readFileSync(alertsPath, 'utf8')) : [];
    const securityAnomalies = fs.existsSync(securityPath) ? JSON.parse(fs.readFileSync(securityPath, 'utf8')) : [];

    res.json({
      hasData: true,
      results,
      auditLog,
      alerts,
      securityAnomalies
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ReconAgent server running on port ${PORT}`);
});
