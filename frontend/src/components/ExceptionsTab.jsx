import React, { useState } from 'react';
import { ArrowRight, CircleAlert, FileWarning, PencilLine, Check, X } from 'lucide-react';

export default function ExceptionsTab({ exceptions, onResolveSuccess }) {
  const unresolved = exceptions?.unresolvedSettlements || [];
  const [activeModal, setActiveModal] = useState(null); // { item, type: 'match' | 'writeoff' }
  const [orderInput, setOrderInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!unresolved.length) {
    return (
      <div className="workspace-empty">
        <FileWarning size={28} />
        <div>
          <strong>No exception debt</strong>
          <p>Zero unresolved exceptions. Every settlement record is currently matched.</p>
        </div>
      </div>
    );
  }

  const handleOpenAction = (item, type) => {
    setActiveModal({ item, type });
    setOrderInput(`ORD_${item.settlement_id.replace('SETTL_', '')}`);
    setNoteInput('');
    setFeedback(null);
  };

  const handleConfirmAction = async () => {
    if (!activeModal) return;
    setIsSubmitting(true);
    setFeedback(null);

    const { item, type } = activeModal;
    const action = type === 'match' ? 'force_match' : 'write_off';

    try {
      const res = await fetch('/api/exceptions/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlement_id: item.settlement_id,
          action,
          matched_internal_id: orderInput || undefined,
          note: noteInput || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        if (onResolveSuccess) {
          onResolveSuccess(data.results, data.alerts, data.securityAnomalies, data.auditLog);
        }
        setTimeout(() => setActiveModal(null), 700);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to resolve exception' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="data-workspace">
      <div className="queue-header">
        <div>
          <span className="eyebrow">Human review queue</span>
          <strong>{unresolved.length} records need a decision</strong>
          <p>Resolve, force match, or write off each item with a clear audit trail.</p>
        </div>
        <div className="queue-total">
          <span>Open exposure</span>
          <b>₹{unresolved.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString('en-IN')}</b>
        </div>
      </div>

      <div className="exception-list">
        {unresolved.map((item, idx) => (
          <article className="exception-card" key={idx}>
            <div className="exception-ident">
              <div className="exception-icon">
                <CircleAlert size={18} />
              </div>
              <div>
                <span className="severity-label danger-text">UNRESOLVED</span>
                <h3>{item.settlement_id}</h3>
                <p>{item.unresolved_reason || item.reason || 'Flagged for manual review'}</p>
              </div>
            </div>
            <div className="exception-facts">
              <span>
                <small>Amount</small>
                <b>₹{item.amount?.toLocaleString('en-IN')}</b>
              </span>
              <span>
                <small>UTR / Ref</small>
                <b>{item.utr || item.payment_id || 'Not available'}</b>
              </span>
            </div>
            <div className="exception-actions">
              <button className="secondary-btn" onClick={() => handleOpenAction(item, 'match')}>
                <PencilLine size={15} /> Force match
              </button>
              <button className="danger-btn" onClick={() => handleOpenAction(item, 'writeoff')}>
                Write off <ArrowRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Action Modal */}
      {activeModal && (
        <div className="certificate-overlay">
          <div className="certificate-modal" style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                {activeModal.type === 'match' ? 'Force Match Settlement' : 'Write Off Unresolved Exception'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '18px' }}>
              {activeModal.type === 'match'
                ? `Assign an internal order reference to settlement ${activeModal.item.settlement_id} (₹${activeModal.item.amount?.toLocaleString('en-IN')}).`
                : `Confirm writing off exposure for settlement ${activeModal.item.settlement_id} (₹${activeModal.item.amount?.toLocaleString('en-IN')}).`}
            </p>

            {feedback && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', background: feedback.type === 'error' ? '#ff818122' : '#8bf1d322', color: feedback.type === 'error' ? 'var(--red)' : 'var(--cyan)' }}>
                {feedback.message}
              </div>
            )}

            {activeModal.type === 'match' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '6px' }}>
                  Internal Order ID / Reference
                </label>
                <input
                  type="text"
                  value={orderInput}
                  onChange={e => setOrderInput(e.target.value)}
                  placeholder="e.g. ORD_MANUAL_1001"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: '12px', outline: 0 }}
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '6px' }}>
                Audit Reason / Note
              </label>
              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Optional manager note for audit log"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: '12px', outline: 0 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="secondary-btn" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className={activeModal.type === 'match' ? 'primary-btn' : 'danger-btn'}
                onClick={handleConfirmAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing…' : activeModal.type === 'match' ? 'Confirm Force Match' : 'Confirm Write Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
