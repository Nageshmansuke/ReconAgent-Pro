import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

export default function AuditTable({ auditLogs }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[var(--text-secondary)]">
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

  const getBadgeClass = (layer) => {
    switch (layer) {
      case 'exact': return 'badge-exact';
      case 'fuzzy': return 'badge-fuzzy';
      case 'ai': return 'badge-ai';
      default: return 'badge-unresolved';
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Per-Record Reconciliation Audit Trail</h3>
          <p className="text-xs text-[var(--text-secondary)]">Transparent log documenting which layer resolved each record and why.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search ID, UTR, ref, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-dim)] focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] outline-none transition-all"
            />
          </div>

          {/* Layer Filter */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 outline-none"
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-[var(--bg-card)] text-[var(--text-secondary)] uppercase font-semibold border-b border-[var(--border-dim)]">
            <tr>
              <th className="py-3 px-4">Settlement ID</th>
              <th className="py-3 px-4">Payment Ref</th>
              <th className="py-3 px-4">UTR</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Resolving Layer</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Reason & Decision</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-dim)]">
            {filteredLogs.map((item, idx) => {
              const isExpanded = expandedId === item.settlement_id;
              const confidenceStr = item.confidence ? `${Math.round(item.confidence * 100)}%` : '--';

              return (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.settlement_id)}>
                    <td className="py-3 px-4 font-mono text-[var(--text-primary)] font-medium">{item.settlement_id}</td>
                    <td className="py-3 px-4 font-mono text-cyan-500">{item.payment_id || '--'}</td>
                    <td className="py-3 px-4 font-mono">{item.utr || '--'}</td>
                    <td className="py-3 px-4 text-[var(--text-primary)] font-semibold">₹{item.amount?.toLocaleString('en-IN') || '0'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge-chip ${getBadgeClass(item.resolving_layer)}`}>
                        {item.resolving_layer === 'none' ? 'UNRESOLVED' : item.resolving_layer.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{confidenceStr}</td>
                    <td className="py-3 px-4 text-[var(--text-primary)] max-w-xs truncate">{item.reason}</td>
                    <td className="py-3 px-2 text-right">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[var(--bg-card)]">
                      <td colSpan="8" className="p-4 border-b border-[var(--border-dim)]">
                        <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-dim)]">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-2">
                            <Code2 className="w-4 h-4" /> Expanded Audit Record Details
                          </div>
                          <pre className="text-xs font-mono text-cyan-500 bg-[var(--bg-card)] p-3 rounded-lg overflow-x-auto border border-[var(--border-dim)]">
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
