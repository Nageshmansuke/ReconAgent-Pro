import React from 'react';
import { X, Printer, ShieldCheck, CheckSquare, Award } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0A0C10] border-2 border-[#F5C453] w-full max-w-3xl rounded-2xl p-8 text-white relative shadow-2xl my-8 print:p-0 print:border-none print:bg-white print:text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white p-1 rounded-lg print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="text-center border-b border-[#1E2532] pb-6 mb-6 print:border-black">
          <div className="inline-flex p-3 rounded-full bg-[#F5C453]/10 text-[#F5C453] mb-3 print:hidden">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white print:text-black">
            OFFICIAL FINANCIAL RECONCILIATION & AUDIT CERTIFICATE
          </h2>
          <p className="text-xs text-[#F5C453] font-mono mt-1 print:text-black">
            Certificate ID: {certId} | Issued: {certDate}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1 print:text-gray-600">
            Certified compliant under Chartered Accountants & FinOps Reconciliation Audit Standards
          </p>
        </div>

        {/* Key Metrics Certification Grid */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-[#12161F] border border-[#1E2532] mb-6 print:bg-gray-100 print:border-black">
          <div className="text-center">
            <span className="text-[11px] text-[#9CA3AF] block font-semibold uppercase print:text-black">Match Rate</span>
            <span className="text-2xl font-extrabold text-[#F5C453] font-mono print:text-black">{metrics.matchRate}%</span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-[#9CA3AF] block font-semibold uppercase print:text-black">Precision</span>
            <span className="text-2xl font-extrabold text-[#34D399] font-mono print:text-black">{metrics.precision}</span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-[#9CA3AF] block font-semibold uppercase print:text-black">Recall</span>
            <span className="text-2xl font-extrabold text-[#38BDF8] font-mono print:text-black">{metrics.recall}</span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-[#9CA3AF] block font-semibold uppercase print:text-black">F1 Score</span>
            <span className="text-2xl font-extrabold text-[#C084FC] font-mono print:text-black">{metrics.f1Score}</span>
          </div>
        </div>

        {/* Unresolved Exceptions Sign-off Ledger */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2 print:text-black">
            <CheckSquare className="w-4 h-4 text-[#F5C453] print:text-black" />
            Unresolved Exceptions Queue for CA / Auditor Sign-Off ({unresolved.length})
          </h4>
          <p className="text-xs text-[#9CA3AF] mb-3 print:text-gray-600">The following exceptions were flagged transparently for manual review.</p>

          <div className="border border-[#1E2532] rounded-lg overflow-hidden print:border-black">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12161F] text-[#9CA3AF] print:bg-gray-200 print:text-black font-semibold">
                <tr>
                  <th className="p-2.5">Sign-Off</th>
                  <th className="p-2.5">Settlement ID</th>
                  <th className="p-2.5">Amount</th>
                  <th className="p-2.5">Flagged Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2532] print:divide-black">
                {unresolved.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-[#9CA3AF] print:text-black">No unresolved exceptions — 100% matched!</td>
                  </tr>
                ) : (
                  unresolved.map((ex, i) => (
                    <tr key={i}>
                      <td className="p-2.5">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-400" />
                      </td>
                      <td className="p-2.5 font-mono text-[#38BDF8] print:text-black">{ex.settlement_id}</td>
                      <td className="p-2.5 font-mono font-bold">₹{ex.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-rose-300 print:text-black">{ex.unresolved_reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor Sign-off Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#1E2532] mt-8 print:border-black">
          <div>
            <div className="h-12 border-b border-dashed border-[#9CA3AF] mb-2"></div>
            <span className="text-xs font-semibold text-white print:text-black block">Chartered Accountant (CA) Signature</span>
            <span className="text-[11px] text-[#9CA3AF] print:text-gray-600 block">Name & Membership No: _________________</span>
          </div>

          <div>
            <div className="h-12 border-b border-dashed border-[#9CA3AF] mb-2"></div>
            <span className="text-xs font-semibold text-white print:text-black block">Finance Controller / CFO Sign-Off</span>
            <span className="text-[11px] text-[#9CA3AF] print:text-gray-600 block">ReconAgent Verification Timestamp: {certDate}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-6 print:hidden">
          <button onClick={onClose} className="btn btn-outline text-xs">Close</button>
          <button onClick={handlePrint} className="btn btn-gold text-xs">
            <Printer className="w-4 h-4" /> Print / Save PDF Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
