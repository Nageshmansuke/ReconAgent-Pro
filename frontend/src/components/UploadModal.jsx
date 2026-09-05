import React, { useState } from 'react';
import { X, FileUp, CheckCircle2 } from 'lucide-react';

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
    <div className="certificate-overlay">
      <div className="certificate-modal" style={{ maxWidth: '580px', padding: '28px' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer' }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '22px' }}>
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>Data Ingestion</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: 'var(--text)' }}>
            Reconcile Operational Data Files
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
            Upload CSV or JSON statements for gateway settlements and internal sales ledgers.
          </p>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', background: '#ff818122', border: '1px solid #ff818166', color: 'var(--red)', fontSize: '12px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
          {/* Settlement Dropzone */}
          <div style={{ border: '1px dashed var(--line)', background: 'var(--surface-2)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <FileUp size={22} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>1. Gateway Settlement File</span>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Razorpay / Stripe CSV or JSON</span>
              <input
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleSettlementChange}
                style={{ display: 'none' }}
              />
            </label>
            {settlementFile && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> {settlementFile.name}
              </div>
            )}
          </div>

          {/* Ledger Dropzone */}
          <div style={{ border: '1px dashed var(--line)', background: 'var(--surface-2)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <FileUp size={22} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>2. Sales Ledger File</span>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Tally / QuickBooks CSV or JSON</span>
              <input
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleLedgerChange}
                style={{ display: 'none' }}
              />
            </label>
            {ledgerFile && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> {ledgerFile.name}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <button
            onClick={downloadSampleTemplates}
            type="button"
            className="secondary-btn"
            style={{ fontSize: '11px' }}
          >
            Download Sample CSVs
          </button>

          <button
            onClick={handleSubmit}
            disabled={!settlementContent || !ledgerContent || isProcessing}
            className="primary-btn"
            style={{ fontSize: '11px' }}
          >
            {isProcessing ? 'Processing Data...' : 'Run Real-Time Reconciliation'}
          </button>
        </div>
      </div>
    </div>
  );
}
