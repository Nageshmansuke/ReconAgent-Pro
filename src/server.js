import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateSyntheticData } from './generator.js';
import { runPipeline } from './pipeline.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ReconAgent', version: '1.0.0' });
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

// Run reconciliation pipeline
app.post('/api/reconcile', async (req, res) => {
  try {
    const simulateFailure = req.body?.simulateFailure === true;
    const results = await runPipeline({ simulateFailure });
    res.json({
      success: true,
      message: 'Reconciliation pipeline completed successfully.',
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch latest results and audit log
app.get('/api/results', (req, res) => {
  try {
    const resultsPath = path.join(DATA_DIR, 'results.json');
    const auditPath = path.join(DATA_DIR, 'audit_log.json');

    if (!fs.existsSync(resultsPath)) {
      return res.json({
        hasData: false,
        message: 'No reconciliation results found yet. Please run reconciliation.'
      });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const auditLog = fs.existsSync(auditPath)
      ? JSON.parse(fs.readFileSync(auditPath, 'utf8'))
      : [];

    res.json({
      hasData: true,
      results,
      auditLog
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ReconAgent server running on port ${PORT}`);
});
