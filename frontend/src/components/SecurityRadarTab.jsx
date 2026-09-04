import React from 'react';
import { Eye, Fingerprint, LockKeyhole, ShieldCheck, Siren, ArrowUpRight } from 'lucide-react';

export default function SecurityRadarTab({ securityAnomalies, onNavigate }) {
  const items = securityAnomalies || [];
  if (!items.length) {
    return (
      <div className="workspace-empty">
        <ShieldCheck size={28} />
        <div>
          <strong>Radar is quiet</strong>
          <p>Ghost payout and UTR recycling detectors are active. No security anomalies flagged.</p>
        </div>
      </div>
    );
  }

  const handleCardClick = (item) => {
    if (onNavigate) {
      onNavigate(item.targetTab || 'exceptions', item.filter || 'all');
    }
  };

  return (
    <div className="data-workspace">
      <div className="security-banner">
        <div className="radar-pulse"><Eye size={22} /></div>
        <div>
          <span className="eyebrow">Threat surface</span>
          <strong>{items.length} anomal{items.length === 1 ? 'y' : 'ies'} require attention</strong>
          <p>Click any threat signal to view connected records in resolution queue.</p>
        </div>
        <div className="security-status"><LockKeyhole size={15} /> MONITORING</div>
      </div>
      <div className="security-list">
        {items.map((item, idx) => (
          <article
            className="security-card"
            key={idx}
            onClick={() => handleCardClick(item)}
            style={{ cursor: 'pointer' }}
          >
            <div className="security-card-head">
              <div className="security-type">
                <div className="security-icon"><Siren size={18} /></div>
                <div>
                  <span className="severity-label danger-text">{item.severity || 'HIGH'} RISK</span>
                  <h3>{item.type}</h3>
                </div>
              </div>
              <Fingerprint size={19} className="faint-icon" />
            </div>
            <p className="security-detail">{item.details || item.description}</p>
            {item.affectedRecords?.length > 0 && (
              <div className="affected-records">
                <span>Affected records ({item.affectedRecords.length})</span>
                <div>
                  {item.affectedRecords.map((rec, rIdx) => (
                    <div className="record-pill" key={rIdx}>
                      <b>{rec.settlement_id || rec.utr}</b>
                      <span>₹{rec.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mitigation">
              <span>Mitigation</span>
              <strong>{item.mitigation || 'Inspect and isolate affected settlement records'}</strong>
              <ArrowUpRight size={15} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
