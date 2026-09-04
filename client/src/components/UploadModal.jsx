import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [settlementFile, setSettlementFile] = useState(null);
  const [ledgerFile, setLedgerFile] = useState(null);
  const [settlementContent, setSettlementContent] = useState(null);
  const [ledgerContent, setLedgerContent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSettlementChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettlementFile(file);
      const text = await file.text();
      setSettlementContent(text);
    }
  };

  const handleLedgerChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLedgerFile(file);
      const text = await file.text();
      setLedgerContent(text);
    }
  };

  const handleSubmit = async () => {
    if (!settlementContent || !ledgerContent) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const isCsv = settlementFile?.name.endsWith('.csv') || settlementContent.includes(',');
      const res = await fetch('/api/upload-and-reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementsContent: settlementContent,
          ledgerContent: ledgerContent,
          fileType: isCsv ? 'csv' : 'json'
        })
      });

      const data = await res.json();
      if (data.success) {
        onUploadSuccess(data.results, data.alerts);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to process real data files');
      }
    } catch (err) {
      setErrorMsg(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleTemplates = () => {
    const sampleSettlementCSV = `settlement_id,utr,payment_id,amount,fee,net_amount,settlement_date,customer_name
SETTL_REAL_1001,UTR987654321001,pay_REAL_101,1500,30,1470,2026-08-15T10:00:00Z,Rahul Sharma
SETTL_REAL_1002,UTR987654321002,pay_REAL_102,2400,0,2400,2026-08-15T11:00:00Z,Priya Patel
SETTL_REAL_1003,UTR987654321003,pay_REAL_103_XX,3200,0,3200,2026-08-15T12:00:00Z,Vikram Sethi`;

    const sampleLedgerCSV = `internal_id,payment_ref,utr,gross_amount,order_date,customer_name
ORD_REAL_5001,pay_REAL_101,UTR987654321001,1500,2026-08-15T10:00:00Z,Rahul Sharma
ORD_REAL_5002,pay_REAL_102,UTR987654321002,2400,2026-08-15T11:00:00Z,Priya Patel
ORD_REAL_5003,pay_REAL_103_ST,UTR987654321003,3200,2026-08-15T12:00:00Z,Vikram S.`;

    const triggerDownload = (name, text) => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', name);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    triggerDownload('sample_gateway_settlements.csv', sampleSettlementCSV);
    setTimeout(() => triggerDownload('sample_internal_ledger.csv', sampleLedgerCSV), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl p-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Reconcile Operational Data Files
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Upload CSV or JSON files for gateway settlement statements and sales ledger exports.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Settlement File Dropzone */}
          <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-lg p-4 text-center">
            <label className="cursor-pointer flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--text-primary)]">1. Gateway Settlement File</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">Razorpay / Stripe CSV or JSON</span>
              <input
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleSettlementChange}
                className="hidden"
              />
            </label>
            {settlementFile && (
              <div className="mt-2 text-xs font-mono text-[var(--color-success)] truncate">
                ✓ {settlementFile.name}
              </div>
            )}
          </div>

          {/* Sales Ledger Dropzone */}
          <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-lg p-4 text-center">
            <label className="cursor-pointer flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--text-primary)]">2. Sales Ledger File</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">Tally / QuickBooks CSV or JSON</span>
              <input
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleLedgerChange}
                className="hidden"
              />
            </label>
            {ledgerFile && (
              <div className="mt-2 text-xs font-mono text-[var(--color-success)] truncate">
                ✓ {ledgerFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={downloadSampleTemplates}
            type="button"
            className="btn-ghost text-xs w-full sm:w-auto"
          >
            Download Sample CSVs
          </button>

          <button
            onClick={handleSubmit}
            disabled={!settlementContent || !ledgerContent || isProcessing}
            className="btn-primary-accent text-xs w-full sm:w-auto"
          >
            {isProcessing ? 'Processing Data...' : 'Run Real-Time Reconciliation'}
          </button>
        </div>
      </div>
    </div>
  );
}
