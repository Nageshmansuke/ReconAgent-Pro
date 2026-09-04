import React, { useState } from 'react';
import { UploadCloud, X, FileText, Download, Play, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl p-6 bg-[#0E121A] border-[#2A3346] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white p-1 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[#F5C453]/10 text-[#F5C453] border border-[#F5C453]/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">📁 Reconcile Your Real Business Data</h3>
            <p className="text-xs text-[#9CA3AF]">Upload CSV or JSON settlement & sales ledger exports from Razorpay, Stripe, QuickBooks, Tally, or ERPs.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Settlement File Dropzone */}
          <div className="bg-[#0A0C10] border-2 border-dashed border-[#2A3346] hover:border-[#F5C453] rounded-xl p-5 text-center transition-all">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-[#F5C453]" />
              <span className="text-sm font-semibold text-white">1. Gateway Settlement File</span>
              <span className="text-xs text-[#9CA3AF]">Razorpay / Stripe CSV or JSON</span>
              <input
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleSettlementChange}
                className="hidden"
              />
            </label>
            {settlementFile && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/10 text-[#34D399] text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {settlementFile.name}
              </div>
            )}
          </div>

          {/* Sales Ledger Dropzone */}
          <div className="bg-[#0A0C10] border-2 border-dashed border-[#2A3346] hover:border-[#38BDF8] rounded-xl p-5 text-center transition-all">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-[#38BDF8]" />
              <span className="text-sm font-semibold text-white">2. Sales Ledger File</span>
              <span className="text-xs text-[#9CA3AF]">Tally / QuickBooks CSV or JSON</span>
              <input
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleLedgerChange}
                className="hidden"
              />
            </label>
            {ledgerFile && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/10 text-[#34D399] text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {ledgerFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1E2532]">
          <button
            onClick={downloadSampleTemplates}
            type="button"
            className="btn btn-outline text-xs text-[#9CA3AF] hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
            📥 Download Sample CSV Templates
          </button>

          <button
            onClick={handleSubmit}
            disabled={!settlementContent || !ledgerContent || isProcessing}
            className="btn btn-gold w-full sm:w-auto"
          >
            <Play className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Processing Real Data...' : '🚀 Run Real-Time Reconciliation'}
          </button>
        </div>
      </div>
    </div>
  );
}
