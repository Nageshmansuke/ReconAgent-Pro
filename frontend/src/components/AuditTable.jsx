import React, { useState, useEffect } from 'react';
import { CheckCircle2, Filter, Search } from 'lucide-react';

export default function AuditTable({ auditLogs, initialLayer = 'all' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState(initialLayer);

  useEffect(() => {
    if (initialLayer) {
      setSelectedLayer(initialLayer);
    }
  }, [initialLayer]);

  if (!auditLogs?.length) {
    return (
      <div className="workspace-empty">
        <CheckCircle2 size={28} />
        <div>
          <strong>No audit history yet</strong>
          <p>Run the pipeline or upload files to generate a traceable audit record.</p>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(item => {
    const isException = item.resolving_layer === 'none' || item.resolving_layer === 'unresolved' || item.status === 'unresolved';
    const matchesLayer = selectedLayer === 'all' ||
      (selectedLayer === 'none' ? isException : item.resolving_layer === selectedLayer);
    
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || [item.settlement_id, item.payment_id, item.utr, item.reason, item.internal_id]
      .some(v => v?.toLowerCase().includes(q));

    return matchesLayer && matchesQuery;
  });

  return (
    <div className="audit-workspace">
      <div className="audit-controls">
        <label>
          <Search size={15} />
          <input
            placeholder="Search IDs, UTRs, reasons…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </label>
        <label className="filter-select">
          <Filter size={15} />
          <select value={selectedLayer} onChange={e => setSelectedLayer(e.target.value)}>
            <option value="all">All resolution layers</option>
            <option value="exact">Exact match</option>
            <option value="fuzzy">Fuzzy match</option>
            <option value="ai">AI escalation</option>
            <option value="none">Exceptions & Unresolved</option>
            <option value="human">Human resolved</option>
          </select>
        </label>
        <span className="audit-result">{filteredLogs.length} records</span>
      </div>
      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Settlement</th>
              <th>Payment ref</th>
              <th>Amount</th>
              <th>Resolution</th>
              <th>Confidence</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                  No audit records match the selected layer filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <b>{item.settlement_id}</b>
                    <small>{item.utr || 'UTR unavailable'}</small>
                  </td>
                  <td>{item.payment_id || '—'}</td>
                  <td className="amount">₹{item.amount?.toLocaleString('en-IN') || '0'}</td>
                  <td>
                    <span className={`layer-chip ${item.resolving_layer}`}>{item.resolving_layer}</span>
                  </td>
                  <td>{item.confidence != null ? `${Math.round(item.confidence * 100)}%` : '—'}</td>
                  <td className="reason-cell" title={item.reason}>{item.reason || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
