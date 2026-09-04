import React from 'react';
import { X } from 'lucide-react';

export default function AuditCertificateModal({ isOpen, onClose, results }) {
  if (!isOpen || !results) return null;

  const metrics = results.metrics || {};
  const unresolved = results.exceptions?.unresolvedSettlements || [];
  const certId = `CERT_${Date.now().toString(36).toUpperCase()}`;
  const certDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] w-full max-w-2xl rounded-lg p-6 text-[var(--text-primary)] relative shadow-2xl my-8 print:p-0 print:border-none print:bg-white print:text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Header */}
        <div className="text-center border-b border-[var(--border-subtle)] pb-4 mb-6 print:border-black">
          <h2 className="text-base font-bold uppercase tracking-wider text-[var(--text-primary)] print:text-black">
            FINANCIAL RECONCILIATION & AUDIT CERTIFICATE
          </h2>
          <p className="text-xs font-mono-numbers text-[var(--text-secondary)] mt-1 print:text-black">
            Certificate ID: {certId} | Issued: {certDate}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 print:text-gray-600">
            Certified under FinOps & Statutory Reconciliation Audit Standards
          </p>
        </div>

        {/* Key Metrics Certification Grid */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-6 print:bg-gray-100 print:border-black">
          <div className="text-center">
            <span className="text-[11px] text-[var(--text-secondary)] block font-medium uppercase print:text-black">Match Rate</span>
            <span className="text-xl font-mono-numbers font-bold text-[var(--text-primary)] print:text-black">{metrics.matchRate}%</span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-[var(--text-secondary)] block font-medium uppercase print:text-black">Precision</span>
            <span className="text-xl font-mono-numbers font-bold text-[var(--text-primary)] print:text-black">{metrics.precision}</span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-[var(--text-secondary)] block font-medium uppercase print:text-black">Recall</span>
            <span className="text-xl font-mono-numbers font-bold text-[var(--text-primary)] print:text-black">{metrics.recall}</span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-[var(--text-secondary)] block font-medium uppercase print:text-black">F1 Score</span>
            <span className="text-xl font-mono-numbers font-bold text-[var(--text-primary)] print:text-black">{metrics.f1Score}</span>
          </div>
        </div>

        {/* Unresolved Exceptions Sign-off Ledger */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2 print:text-black">
            Exceptions Queue for CA Sign-Off ({unresolved.length})
          </h4>

          <div className="border border-[var(--border-subtle)] rounded overflow-hidden print:border-black">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface)] text-[var(--text-secondary)] print:bg-gray-200 print:text-black font-semibold">
                <tr>
                  <th className="p-2">Settlement ID</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Flagged Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] print:divide-black">
                {unresolved.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-3 text-center text-[var(--text-secondary)] print:text-black">Zero exceptions — 100% verified match.</td>
                  </tr>
                ) : (
                  unresolved.map((ex, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono-numbers text-[var(--text-primary)] print:text-black">{ex.settlement_id}</td>
                      <td className="p-2 font-mono-numbers font-medium">₹{ex.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-[var(--color-danger)] print:text-black">{ex.unresolved_reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor Sign-off Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[var(--border-subtle)] mt-6 print:border-black">
          <div>
            <div className="h-10 border-b border-dashed border-[var(--border-subtle)] mb-2"></div>
            <span className="text-xs font-medium text-[var(--text-primary)] print:text-black block">Chartered Accountant (CA) Signature</span>
            <span className="text-[11px] text-[var(--text-tertiary)] print:text-gray-600 block">Membership No: _________________</span>
          </div>

          <div>
            <div className="h-10 border-b border-dashed border-[var(--border-subtle)] mb-2"></div>
            <span className="text-xs font-medium text-[var(--text-primary)] print:text-black block">Finance Controller Sign-Off</span>
            <span className="text-[11px] font-mono-numbers text-[var(--text-tertiary)] print:text-gray-600 block">Timestamp: {certDate}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-6 print:hidden">
          <button onClick={onClose} className="btn-ghost text-xs">Close</button>
          <button onClick={handlePrint} className="btn-primary-accent text-xs">
            Print / Save PDF Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
