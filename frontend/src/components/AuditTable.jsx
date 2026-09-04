import React, { useState } from 'react';

export default function AuditTable({ auditLogs }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('all');

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="terminal-card p-6 text-center text-xs text-[var(--text-secondary)]">
        ✓ No audit log available. Run pipeline or upload files to generate audit records.
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(item => {
    const matchesLayer = selectedLayer === 'all' || item.resolving_layer === selectedLayer;
    const matchesSearch = searchQuery === '' ||
      item.settlement_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.utr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLayer && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs font-medium text-[var(--text-secondary)]">
          Audit Trail ({filteredLogs.length} records)
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search ID, UTR, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="terminal-input text-xs py-1.5 px-3 w-full sm:w-48"
          />

          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="terminal-input text-xs py-1.5 px-2.5 bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            <option value="all">All Layers</option>
            <option value="exact">Layer 1 (Exact)</option>
            <option value="fuzzy">Layer 2 (Fuzzy)</option>
            <option value="ai">Layer 3 (AI)</option>
            <option value="none">Exceptions</option>
          </select>
        </div>
      </div>

      {/* Terminal Data Table */}
      <div className="data-table-container">
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th>Payment Ref</th>
              <th>UTR</th>
              <th>Amount</th>
              <th>Layer</th>
              <th>Confidence</th>
              <th>Audit Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((item, idx) => {
              const confidenceStr = item.confidence ? `${Math.round(item.confidence * 100)}%` : '—';

              return (
                <tr key={idx}>
                  <td className="font-mono-numbers text-[var(--text-primary)]">{item.settlement_id}</td>
                  <td className="font-mono-numbers text-[var(--text-secondary)]">{item.payment_id || '—'}</td>
                  <td className="font-mono-numbers text-[var(--text-secondary)]">{item.utr || '—'}</td>
                  <td className="font-mono-numbers font-medium text-[var(--text-primary)]">₹{item.amount?.toLocaleString('en-IN') || '0'}</td>
                  <td>
                    <span className={`text-xs font-mono ${
                      item.resolving_layer === 'exact' ? 'text-[var(--color-success)]' :
                      item.resolving_layer === 'fuzzy' ? 'text-[var(--color-caution)]' :
                      item.resolving_layer === 'ai' ? 'text-[var(--accent-blue)]' :
                      'text-[var(--color-danger)]'
                    }`}>
                      {item.resolving_layer.toUpperCase()}
                    </span>
                  </td>
                  <td className="font-mono-numbers text-[var(--text-secondary)]">{confidenceStr}</td>
                  <td className="text-[var(--text-secondary)] max-w-xs truncate">{item.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
