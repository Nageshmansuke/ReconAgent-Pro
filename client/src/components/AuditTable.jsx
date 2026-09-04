import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

export default function AuditTable({ auditLogs }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="recon-card p-8 text-center text-[var(--text-secondary)] font-medium">
        No audit log available. Click "Run Pipeline" or upload real files to generate results.
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

  const getPillClass = (layer) => {
    switch (layer) {
      case 'exact': return 'pill-exact';
      case 'fuzzy': return 'pill-fuzzy';
      case 'ai': return 'pill-ai';
      default: return 'pill-unresolved';
    }
  };

  return (
    <div className="recon-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Per-Record Reconciliation Audit Trail</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Transparent log documenting which layer resolved each record and why.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search ID, UTR, ref, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-dim)] focus:border-indigo-500 rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Layer Filter */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-dim)] text-[var(--text-primary)] text-xs rounded-lg px-3 py-2 outline-none"
            >
              <option value="all">All Layers ({auditLogs.length})</option>
              <option value="exact">Layer 1 (Exact)</option>
              <option value="fuzzy">Layer 2 (Fuzzy)</option>
              <option value="ai">Layer 3 (AI)</option>
              <option value="none">Unresolved Exceptions</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th>Payment Ref</th>
              <th>UTR</th>
              <th>Amount</th>
              <th>Resolving Layer</th>
              <th>Confidence</th>
              <th>Reason & Decision</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((item, idx) => {
              const isExpanded = expandedId === item.settlement_id;
              const confidenceStr = item.confidence ? `${Math.round(item.confidence * 100)}%` : '--';

              return (
                <React.Fragment key={idx}>
                  <tr className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.settlement_id)}>
                    <td className="font-mono font-semibold text-[var(--text-primary)]">{item.settlement_id}</td>
                    <td className="font-mono text-cyan-500">{item.payment_id || '--'}</td>
                    <td className="font-mono">{item.utr || '--'}</td>
                    <td className="font-semibold text-[var(--text-primary)]">₹{item.amount?.toLocaleString('en-IN') || '0'}</td>
                    <td>
                      <span className={`status-pill ${getPillClass(item.resolving_layer)}`}>
                        {item.resolving_layer === 'none' ? 'UNRESOLVED' : item.resolving_layer.toUpperCase()}
                      </span>
                    </td>
                    <td className="font-mono">{confidenceStr}</td>
                    <td className="max-w-xs truncate">{item.reason}</td>
                    <td className="text-right">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)] inline" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] inline" />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan="8" className="p-4 bg-[var(--bg-input)]">
                        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-dim)]">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-2">
                            <Code2 className="w-4 h-4" /> Expanded Audit Record Details
                          </div>
                          <pre className="text-xs font-mono text-cyan-500 bg-[var(--bg-main)] p-3 rounded-lg overflow-x-auto border border-[var(--border-dim)]">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
