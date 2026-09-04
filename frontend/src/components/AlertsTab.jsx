import React from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, ShieldAlert } from 'lucide-react';

export default function AlertsTab({ alerts, onNavigate }) {
  const items = alerts || [];
  const high = items.filter(item => item.severity === 'HIGH' || item.severity === 'critical').length;
  const medium = items.filter(item => item.severity === 'MEDIUM' || item.severity === 'warning').length;

  if (!items.length) {
    return (
      <div className="workspace-empty">
        <CheckCircle2 size={28} />
        <div>
          <strong>All clear for now</strong>
          <p>No financial alerts or anomalies were detected in the latest run.</p>
        </div>
      </div>
    );
  }

  const handleAlertClick = (alert) => {
    if (onNavigate) {
      onNavigate(alert.targetTab || 'exceptions', alert.filter || 'all');
    }
  };

  return (
    <div className="data-workspace">
      <div className="insight-strip">
        <div>
          <span className="eyebrow">Signal overview</span>
          <strong>{items.length} active signals</strong>
          <small>Click any signal to navigate directly to resolution workspace</small>
        </div>
        <div className="signal-counts">
          <span className="high"><b>{high}</b> high</span>
          <span className="medium"><b>{medium}</b> medium</span>
          <span className="low"><b>{Math.max(0, items.length - high - medium)}</b> low</span>
        </div>
      </div>
      <div className="alert-grid">
        {items.map((alert, idx) => {
          const sevClass = alert.severity?.toLowerCase() === 'critical' ? 'high' : (alert.severity?.toLowerCase() || 'low');
          return (
            <article
              className={`alert-card ${sevClass}`}
              key={idx}
              onClick={() => handleAlertClick(alert)}
              style={{ cursor: 'pointer' }}
            >
              <div className="alert-card-top">
                <div className="alert-icon">
                  {sevClass === 'high' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <span className="severity-label">{alert.severity || 'INFO'} PRIORITY</span>
                  <h3>{alert.title}</h3>
                </div>
                <span className="alert-time">
                  <Clock3 size={13} /> {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                </span>
              </div>
              <p>{alert.message}</p>
              <div className="recommendation">
                <span>Recommended action</span>
                <strong>{alert.action || 'Inspect related transaction records'}</strong>
                <ArrowUpRight size={15} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
