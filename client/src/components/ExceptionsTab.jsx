import React from 'react';
import { ShieldAlert, UserCheck } from 'lucide-react';

export default function ExceptionsTab({ exceptions }) {
  const list = exceptions?.unresolvedSettlements || [];

  if (!list || list.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[#9CA3AF]">
        <UserCheck className="w-10 h-10 mx-auto text-[#10B981] mb-2 opacity-60" />
        No unresolved exceptions — 100% matched!
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Unresolved Exceptions & Flagged Records</h3>
        <p className="text-xs text-[#9CA3AF]">These items could not be resolved deterministically or by AI with high confidence. Preserved transparently with plain-English explanation.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#9CA3AF]">
          <thead className="bg-[#0A0C10] text-[#9CA3AF] uppercase font-semibold border-b border-[#1E2532]">
            <tr>
              <th className="py-3 px-4">Settlement ID</th>
              <th className="py-3 px-4">Payment Ref</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Settlement Date</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Flagged Reason & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2532]">
            {list.map((ex, idx) => {
              const dateStr = ex.settlement_date ? new Date(ex.settlement_date).toLocaleDateString('en-IN') : '--';

              return (
                <tr key={idx} className="hover:bg-[#181E2A]/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-white font-medium">{ex.settlement_id}</td>
                  <td className="py-3 px-4 font-mono text-[#F43F5E]">{ex.payment_id || '--'}</td>
                  <td className="py-3 px-4 text-white font-medium">₹{ex.amount?.toLocaleString('en-IN') || '0'}</td>
                  <td className="py-3 px-4">{dateStr}</td>
                  <td className="py-3 px-4 text-white">{ex.customer_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-rose-300">
                    <span className="badge-pill badge-unresolved mr-2">FLAGGED</span>
                    {ex.unresolved_reason || 'Unresolved — flagged for human review'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
